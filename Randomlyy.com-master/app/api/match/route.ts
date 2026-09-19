import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export const runtime = "nodejs";

const WAITING_KEY = "randomlyy:waiting";
const MATCH_PREFIX = "randomlyy:match:";
const SEEN_PREFIX = "randomlyy:seen:";

const MATCH_TTL = 2 * 60 * 60;
const WAITING_TIMEOUT = 10 * 60 * 1000;

type MatchData = {
  status: "matched" | "ended";
  roomId: string;
  partnerId: string;
};

function matchKey(userId: string) {
  return `${MATCH_PREFIX}${userId}`;
}

function seenKey(userId: string) {
  return `${SEEN_PREFIX}${userId}`;
}

/*
 * This script performs matching atomically.
 *
 * Example:
 *
 * A joins -> waiting
 * B joins -> A + B matched
 * C joins -> waiting
 * D joins -> C + D matched
 *
 * Each pair receives one unique LiveKit room.
 */
const MATCH_SCRIPT = `
local waitingKey = KEYS[1]

local userId = ARGV[1]
local roomId = ARGV[2]
local now = tonumber(ARGV[3])
local staleTime = tonumber(ARGV[4])

-- Remove the current user from the waiting queue first.
redis.call(
  "ZREM",
  waitingKey,
  userId
)

-- Remove users who have been waiting too long.
local staleUsers = redis.call(
  "ZRANGEBYSCORE",
  waitingKey,
  "-inf",
  staleTime
)

for _, staleId in ipairs(staleUsers) do
  redis.call(
    "ZREM",
    waitingKey,
    staleId
  )
end

-- Look for waiting users.
local candidates = redis.call(
  "ZRANGE",
  waitingKey,
  0,
  99
)

for _, candidateId in ipairs(candidates) do

  -- Never match a user with themselves.
  if candidateId ~= userId then

    -- Do not select somebody who is already matched.
    local candidateMatch = redis.call(
      "GET",
      "randomlyy:match:" .. candidateId
    )

    if not candidateMatch then

      -- Do not immediately match users who have already met.
      local alreadySeen = redis.call(
        "SISMEMBER",
        "randomlyy:seen:" .. userId,
        candidateId
      )

      if alreadySeen == 0 then

        -- Remove candidate atomically.
        local removed = redis.call(
          "ZREM",
          waitingKey,
          candidateId
        )

        if removed == 1 then

          local myMatch = cjson.encode({
            status = "matched",
            roomId = roomId,
            partnerId = candidateId
          })

          local partnerMatch = cjson.encode({
            status = "matched",
            roomId = roomId,
            partnerId = userId
          })

          -- Save the SAME room ID for both users.
          redis.call(
            "SET",
            "randomlyy:match:" .. userId,
            myMatch,
            "EX",
            7200
          )

          redis.call(
            "SET",
            "randomlyy:match:" .. candidateId,
            partnerMatch,
            "EX",
            7200
          )

          -- Remember that these users have met.
          redis.call(
            "SADD",
            "randomlyy:seen:" .. userId,
            candidateId
          )

          redis.call(
            "SADD",
            "randomlyy:seen:" .. candidateId,
            userId
          )

          return candidateId
        end
      end
    end
  end
end

-- Nobody was available.
-- Put this user into the waiting queue.
redis.call(
  "ZADD",
  waitingKey,
  now,
  userId
)

redis.call(
  "EXPIRE",
  waitingKey,
  600
)

return ""
`;

async function findMatch(userId: string) {
  const roomId = `randomlyy-${crypto.randomUUID()}`;

  const now = Date.now();

  const staleTime = now - WAITING_TIMEOUT;

  await redis.eval(
    MATCH_SCRIPT,
    [WAITING_KEY],
    [
      userId,
      roomId,
      String(now),
      String(staleTime),
    ],
  );

  const result = await redis.get<MatchData>(
    matchKey(userId),
  );

  if (
    result &&
    result.status === "matched"
  ) {
    return result;
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const action =
      typeof body.action === "string"
        ? body.action.trim()
        : "";

    const userId =
      typeof body.userId === "string"
        ? body.userId.trim()
        : "";

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "userId is required.",
        },
        { status: 400 },
      );
    }

    const currentMatchKey = matchKey(userId);

    /*
     * JOIN
     */
    if (action === "join") {
      const existing =
        await redis.get<MatchData>(
          currentMatchKey,
        );

      if (
        existing?.status === "matched"
      ) {
        return NextResponse.json({
          success: true,
          matched: true,
          status: "matched",
          roomId: existing.roomId,
          partnerId: existing.partnerId,
        });
      }

      if (existing) {
        await redis.del(
          currentMatchKey,
        );
      }

      const match =
        await findMatch(userId);

      if (!match) {
        return NextResponse.json({
          success: true,
          matched: false,
          status: "waiting",
        });
      }

      return NextResponse.json({
        success: true,
        matched: true,
        status: "matched",
        roomId: match.roomId,
        partnerId: match.partnerId,
      });
    }

    /*
     * STATUS
     */
    if (action === "status") {
      const current =
        await redis.get<MatchData>(
          currentMatchKey,
        );

      if (!current) {
        return NextResponse.json({
          success: true,
          matched: false,
          status: "waiting",
        });
      }

      if (
        current.status === "ended"
      ) {
        await redis.del(
          currentMatchKey,
        );

        const newMatch =
          await findMatch(userId);

        if (!newMatch) {
          return NextResponse.json({
            success: true,
            matched: false,
            status: "waiting",
          });
        }

        return NextResponse.json({
          success: true,
          matched: true,
          status: "matched",
          roomId: newMatch.roomId,
          partnerId: newMatch.partnerId,
        });
      }

      return NextResponse.json({
        success: true,
        matched: true,
        status: "matched",
        roomId: current.roomId,
        partnerId: current.partnerId,
      });
    }

    /*
     * NEXT
     */
    if (action === "next") {
      const current =
        await redis.get<MatchData>(
          currentMatchKey,
        );

      if (current?.partnerId) {
        const partnerKey =
          matchKey(
            current.partnerId,
          );

        await redis.set(
          partnerKey,
          {
            status: "ended",
            roomId: current.roomId,
            partnerId: userId,
          },
          {
            ex: MATCH_TTL,
          },
        );

        await redis.sadd(
          seenKey(userId),
          current.partnerId,
        );

        await redis.sadd(
          seenKey(current.partnerId),
          userId,
        );
      }

      await redis.del(
        currentMatchKey,
      );

      await redis.zrem(
        WAITING_KEY,
        userId,
      );

      const newMatch =
        await findMatch(userId);

      if (!newMatch) {
        return NextResponse.json({
          success: true,
          matched: false,
          status: "waiting",
        });
      }

      return NextResponse.json({
        success: true,
        matched: true,
        status: "matched",
        roomId: newMatch.roomId,
        partnerId: newMatch.partnerId,
      });
    }

    /*
     * LEAVE
     */
    if (action === "leave") {
      const current =
        await redis.get<MatchData>(
          currentMatchKey,
        );

      if (current?.partnerId) {
        await redis.set(
          matchKey(
            current.partnerId,
          ),
          {
            status: "ended",
            roomId: current.roomId,
            partnerId: userId,
          },
          {
            ex: MATCH_TTL,
          },
        );
      }

      await redis.zrem(
        WAITING_KEY,
        userId,
      );

      await redis.del(
        currentMatchKey,
      );

      return NextResponse.json({
        success: true,
        matched: false,
        status: "left",
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Invalid action.",
      },
      { status: 400 },
    );
  } catch (error) {
    console.error(
      "MATCH API ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Matchmaking service failed.",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Match API is working",
  });
}
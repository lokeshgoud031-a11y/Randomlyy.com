import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export const runtime = "nodejs";

const WAITING_KEY = "randomlyy:waiting";

const MATCH_TTL = 2 * 60 * 60;

const WAITING_TIMEOUT = 10 * 60 * 1000;

type MatchData = {
  status: "matched" | "ended";
  roomId: string;
  partnerId: string;
};

const MATCH_SCRIPT = `
local waitingKey = KEYS[1]

local userId = ARGV[1]
local roomId = ARGV[2]
local now = tonumber(ARGV[3])
local staleTime = tonumber(ARGV[4])

redis.call(
  "ZREM",
  waitingKey,
  userId
)

local staleUsers =
  redis.call(
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

local candidates =
  redis.call(
    "ZRANGE",
    waitingKey,
    0,
    99
  )

for _, candidateId in ipairs(candidates) do

  if candidateId ~= userId then

    local candidateMatch =
      redis.call(
        "GET",
        "randomlyy:match:" .. candidateId
      )

    if not candidateMatch then

      local alreadyMet =
        redis.call(
          "SISMEMBER",
          "randomlyy:seen:" .. userId,
          candidateId
        )

      if alreadyMet == 0 then

        local removed =
          redis.call(
            "ZREM",
            waitingKey,
            candidateId
          )

        if removed == 1 then

          local myMatch =
            cjson.encode({
              status = "matched",
              roomId = roomId,
              partnerId = candidateId
            })

          local theirMatch =
            cjson.encode({
              status = "matched",
              roomId = roomId,
              partnerId = userId
            })

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
            theirMatch,
            "EX",
            7200
          )

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
  const roomId =
    `randomlyy-${crypto.randomUUID()}`;

  const now =
    Date.now();

  const staleTime =
    now - WAITING_TIMEOUT;

  const result =
    await redis.eval(
      MATCH_SCRIPT,
      [WAITING_KEY],
      [
        userId,
        roomId,
        now.toString(),
        staleTime.toString(),
      ],
    );

  const partnerId =
    typeof result === "string"
      ? result
      : "";

  if (!partnerId) {
    return null;
  }

  return await redis.get<MatchData>(
    `randomlyy:match:${userId}`,
  );
}

export async function POST(request: Request) {
  try {
    const body =
      await request.json();

    const action =
      typeof body.action === "string"
        ? body.action
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
        {
          status: 400,
        },
      );
    }

    const matchKey =
      `randomlyy:match:${userId}`;

    /*
     * JOIN
     */

    if (action === "join") {
      const existing =
        await redis.get<MatchData>(
          matchKey,
        );

      if (existing) {
        if (
          existing.status ===
          "matched"
        ) {
          return NextResponse.json({
            success: true,
            matched: true,
            status: "matched",
            roomId:
              existing.roomId,
            partnerId:
              existing.partnerId,
          });
        }

        await redis.del(
          matchKey,
        );
      }

      const match =
        await findMatch(
          userId,
        );

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
        roomId:
          match.roomId,
        partnerId:
          match.partnerId,
      });
    }

    /*
     * STATUS
     */

    if (action === "status") {
      const current =
        await redis.get<MatchData>(
          matchKey,
        );

      if (!current) {
        return NextResponse.json({
          success: true,
          matched: false,
          status: "waiting",
        });
      }

      if (
        current.status ===
        "ended"
      ) {
        await redis.del(
          matchKey,
        );

        const newMatch =
          await findMatch(
            userId,
          );

        if (newMatch) {
          return NextResponse.json({
            success: true,
            matched: true,
            status: "matched",
            roomId:
              newMatch.roomId,
            partnerId:
              newMatch.partnerId,
          });
        }

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
        roomId:
          current.roomId,
        partnerId:
          current.partnerId,
      });
    }

    /*
     * NEXT
     */

    if (action === "next") {
      const current =
        await redis.get<MatchData>(
          matchKey,
        );

      if (
        current?.partnerId
      ) {
        await redis.set(
          `randomlyy:match:${current.partnerId}`,
          {
            status: "ended",
            roomId:
              current.roomId,
            partnerId:
              userId,
          },
          {
            ex: MATCH_TTL,
          },
        );

        await redis.sadd(
          `randomlyy:seen:${userId}`,
          current.partnerId,
        );
      }

      await redis.del(
        matchKey,
      );

      const newMatch =
        await findMatch(
          userId,
        );

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
        roomId:
          newMatch.roomId,
        partnerId:
          newMatch.partnerId,
      });
    }

    /*
     * LEAVE
     */

    if (action === "leave") {
      const current =
        await redis.get<MatchData>(
          matchKey,
        );

      if (
        current?.partnerId
      ) {
        await redis.set(
          `randomlyy:match:${current.partnerId}`,
          {
            status: "ended",
            roomId:
              current.roomId,
            partnerId:
              userId,
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
        matchKey,
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
      {
        status: 400,
      },
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
      {
        status: 500,
      },
    );
  }
}

/*
 * TEST ROUTE
 */

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Match API is working",
  });
}
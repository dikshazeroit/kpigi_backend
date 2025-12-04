import UserModel from "../../application/model/UserModel.js";
import SubscriptionModel from "../models/Subscription.js";
import BlockedModel from "../../application/model/BlockedUserModel.js";
import swipeModel from "../../application/model/SwipeModel.js"


export const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Active Users
    const activeUsersCount = await UserModel.countDocuments({ uc_active: "1" });

    // 2. Verified Card Users
    const verifiedCardUsersCount = await UserModel.countDocuments({ uc_card_verified: true });

    // 3. Subscriptions
    const subscriptionsCount = await SubscriptionModel.countDocuments();

    // 4. Blocked Users
    const blockedUsersCount = await BlockedModel.countDocuments();

    return res.status(200).json({
      status: true,
      message: "Dashboard stats fetched successfully",
      payload: {
        activeUsers: activeUsersCount,
        verifiedCardUsers: verifiedCardUsersCount,
        subscriptions: subscriptionsCount,
        blockedUsers: blockedUsersCount,
      },
    });
  } catch (err) {
    console.error("getDashboardStats error:", err);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};


export const getActiveUsersGrowth = async (req, res) => {
  try {
    const { period = "monthly" } = req.query;

    let pipeline = [
      {
        $match: {
          uc_active: "1", // only active users
          uc_created_at: { $exists: true, $ne: null },
        },
      },
    ];

    if (period === "monthly") {
      pipeline.push(
        {
          $group: {
            _id: { month: { $month: "$uc_created_at" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.month": 1 } }
      );
    } else {
      pipeline.push(
        {
          $group: {
            _id: { week: { $week: "$uc_created_at" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.week": 1 } }
      );
    }

    const result = await UserModel.aggregate(pipeline);

    // 🧹 Transform for frontend (React Chart.js friendly)
    const formatted = result.map((r) => ({
      label: period === "monthly" ? monthName(r._id.month) : `Week ${r._id.week}`,
      count: r.count,
    }));

    res.json({ status: true, payload: formatted });
  } catch (error) {
    console.error("getActiveUsersGrowth error:", error);
    res.status(500).json({ status: false, message: "Internal error" });
  }
};

// Helper → Convert month number to month name
const monthName = (num) => {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return months[num - 1] || "";
};


export const getNewMatches = async (req, res) => {
  try {
    const pipeline = [
      // ✅ Only right / superlike swipes
      {
        $match: {
          direction: { $in: ["right", "superlike"] }
        }
      },
      // ✅ Create a normalized key for each pair (so A-B == B-A)
      {
        $project: {
          pairKey: {
            $cond: [
              { $lt: ["$swiper_uuid", "$swiped_uuid"] },
              { $concat: ["$swiper_uuid", "-", "$swiped_uuid"] },
              { $concat: ["$swiped_uuid", "-", "$swiper_uuid"] }
            ]
          },
          swiper_uuid: 1,
          swiped_uuid: 1,
          createdAt: 1
        }
      },
      // ✅ Group to find both swipes (mutual)
      {
        $group: {
          _id: { pairKey: "$pairKey" },
          users: { $addToSet: "$swiper_uuid" },
          swipes: { $push: "$$ROOT" }
        }
      },
      // ✅ Only keep mutual swipes (both users swiped)
      {
        $match: {
          "users.1": { $exists: true }
        }
      },
      // ✅ Flatten swipes and group by month
      { $unwind: "$swipes" },
      {
        $group: {
          _id: { $month: "$swipes.createdAt" },
          count: { $sum: 1 }
        }
      },
      // ✅ Sort months in order
      { $sort: { "_id": 1 } }
    ];

    const result = await swipeModel.aggregate(pipeline);

    // ✅ Format response with month labels
    const months = [
      "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const formatted = result.map(item => ({
      label: months[item._id],
      count: item.count
    }));

    res.json({ status: true, payload: formatted });
  } catch (error) {
    console.error("getNewMatches error:", error);
    res.status(500).json({ status: false, message: "Internal error" });
  }
};


export const getRecentUserActivity = async (req, res) => {
  try {
    // ✅ 1. Get latest 5 users by creation date
    const users = await UserModel.find({})
      .sort({ uc_created_at: -1 }) // latest first
      .limit(5)
      .select("uc_uuid uc_full_name uc_gender uc_looking_for uc_created_at")
      .lean();

    if (!users.length) {
      return res.status(200).json({ status: true, payload: [] });
    }

    // ✅ 2. Get all swipes involving these users
    const userIds = users.map(u => u.uc_uuid);

    const swipes = await swipeModel.find({
      $or: [
        { swiper_uuid: { $in: userIds } },
        { swiped_uuid: { $in: userIds } }
      ]
    }).lean();

    // ✅ 3. Process swipes for each user
    const activity = users.map(user => {
      // swipes made by this user
      const userSwipes = swipes.filter(s => s.swiper_uuid === user.uc_uuid);
      const swipeCount = userSwipes.length;

      // matches = when both users swiped each other "right/superlike"
      const matches = userSwipes.filter(swipe => {
        if (["right", "superlike"].includes(swipe.direction)) {
          return swipes.some(
            other =>
              other.swiper_uuid === swipe.swiped_uuid &&
              other.swiped_uuid === user.uc_uuid &&
              ["right", "superlike"].includes(other.direction)
          );
        }
        return false;
      });

      return {
        uc_full_name: user.uc_full_name,
        uc_gender: user.uc_gender,
        uc_looking_for: user.uc_looking_for,
        swipes: swipeCount,
        matches: matches.length,
        created_at: user.uc_created_at
      };
    });

    res.status(200).json({ status: true, payload: activity });
  } catch (error) {
    console.error("getRecentUserActivity error:", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};


export const getUserReligionDistribution = async (req, res) => {
  try {
    const total = await UserModel.countDocuments({
      uc_religion: { $ne: "" } // ✅ only count users with religion filled
    });

    const religions = await UserModel.aggregate([
      { $match: { uc_religion: { $ne: "" } } }, // ✅ filter out empty
      { $group: { _id: "$uc_religion", count: { $sum: 1 } } }
    ]);

    const result = religions.map(r => ({
      religion: r._id,
      count: r.count,
      percentage: total ? Math.round((r.count / total) * 100) : 0
    }));

    res.json({ status: true, payload: result });
  } catch (error) {
    console.error("getUserReligionDistribution error:", error);
    res.status(500).json({ status: false, message: "Internal error" });
  }
};
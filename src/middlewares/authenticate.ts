import { NextFunction, Request, Response } from "express";
import prisma from "../prisma";
const jwt = require("jsonwebtoken");

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;
  const isProduction = process.env.NODE_ENV === "production";

  if (accessToken) {
    try {
      const payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      req.userId = payload.id;
      return next();
    } catch {}
  }

  if (!refreshToken) {
    return res
      .status(401)
      .json({ status: "fail", message: "Not authenticated" });
  }

  try {
    const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });
    if (!stored) {
      return res.status(401).json({ status: "fail", message: "Token revoked" });
    }

    await prisma.refreshToken.delete({ where: { token: refreshToken } });

    const newAccessToken = jwt.sign(
      { id: payload.id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );
    const newRefreshToken = jwt.sign(
      { id: payload.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    await prisma.refreshToken.create({
      data: { token: newRefreshToken, userId: payload.id },
    });

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    req.userId = payload.id;
    next();
  } catch {
    return res
      .status(401)
      .json({ status: "fail", message: "Not authenticated" });
  }
};

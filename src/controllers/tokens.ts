import { NextFunction, Request, Response } from "express";
import prisma from "../prisma";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const isProduction = process.env.NODE_ENV === "production";

export const createToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    let isPasswordValid = false;

    if (user) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    }

    if (!user || !isPasswordValid) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid email or password",
      });
    }

    const accessToken = jwt.sign(
      { id: user.id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      }
    );
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d",
      }
    );

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
      },
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      status: "success",
      message: "Logged in successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const refreshToken = req.cookies.refreshToken;

  try {
    if (refreshToken) {
      await prisma.refreshToken
        .delete({ where: { token: refreshToken } })
        .catch(() => {});
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(204).json({ status: "success", message: "Logged out" });
  } catch (error) {
    next(error);
  }
};

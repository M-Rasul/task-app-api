import { NextFunction, Request, Response } from "express";
import { Prisma } from "../generated/prisma/client";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const errorMessage = (
      err.meta?.driverAdapterError as {
        cause: { originalMessage: string };
      }
    )?.cause?.originalMessage;
    switch (err.code) {
      case "P2002":
        return res.status(409).json({
          status: "fail",
          message: errorMessage,
        });
      case "P2014":
        return res.status(400).json({
          status: "fail",
          message: errorMessage,
        });
      case "P2025":
        return res.status(404).json({
          status: "fail",
          message: errorMessage,
        });
      default:
        return res.status(400).json({
          status: "fail",
          message: "An error occurred with the database request.",
        });
    }
  }

  res.status(err.statusCode || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
};

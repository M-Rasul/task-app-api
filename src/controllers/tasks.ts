import { NextFunction, Request, Response } from "express";
import prisma from "../prisma";

export const checkTaskOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params as { id: string };
  const { userId } = req;
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task || task.userId !== userId) {
    return res.status(404).json({ status: "fail", message: "Task not found" });
  }
  next();
};

export const getTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;
  const { page = 1, pageSize = 10, q = "", done } = req.query;
  const skip = (Number(page) - 1) * Number(pageSize);

  const where = {
    userId,
    title: {
      contains: q as string,
      mode: "insensitive" as const,
    },
    done: done ? (done === "true" ? true : false) : undefined,
  };

  try {
    const tasks = await prisma.task.findMany({
      where: {
        userId,
        title: {
          contains: q as string,
          mode: "insensitive",
        },
        done: done ? (done === "true" ? true : false) : undefined,
      },
      orderBy: {
        createdAt: "asc",
      },
      skip,
      take: Number(pageSize),
    });

    const totalCount = await prisma.task.count({ where });
    const totalPages = Math.ceil(totalCount / Number(pageSize));

    res.status(200).json({
      status: "success",
      data: { tasks, count: tasks.length, totalPages },
    });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.userId!;
  const { title } = req.body;

  try {
    const task = await prisma.task.create({
      data: {
        title,
        userId,
      },
    });

    res.status(201).json({
      status: "success",
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id as string;
  const { title, done } = req.body;

  try {
    const updatedTask = await prisma.task.update({
      where: { id },
      data: { title, done },
    });

    res.status(200).json({ status: "success", data: { task: updatedTask } });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id as string;

  try {
    await prisma.task.delete({ where: { id } });
    res.status(204).json({ status: "success" });
  } catch (error) {
    next(error);
  }
};

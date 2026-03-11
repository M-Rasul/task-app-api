import { Router } from "express";
import {
  createTask,
  getTasks,
  updateTask,
  checkTaskOwnership,
  deleteTask,
} from "../controllers/tasks";
import { validate } from "../middlewares/validate";
import {
  createTaskSchema,
  updateTaskSchema,
} from "../validators/taskValidator";

const router = Router();

router.route("/").get(getTasks).post(validate(createTaskSchema), createTask);
router
  .route("/:id")
  .put(checkTaskOwnership, validate(updateTaskSchema), updateTask)
  .delete(checkTaskOwnership, deleteTask);

export default router;

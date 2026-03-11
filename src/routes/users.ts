import { Router } from "express";
import { validate } from "../middlewares/validate";
import { createUserSchema } from "../validators/userValidator";
import { createUser } from "../controllers/users";

const router = Router();

router.route("/").post(validate(createUserSchema), createUser);

export default router;

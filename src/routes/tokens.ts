import { Router } from "express";
import { createToken, deleteToken } from "../controllers/tokens";
import { validate } from "../middlewares/validate";
import { createTokenSchema } from "../validators/tokenValidators";

const router = Router();

router
  .route("/")
  .post(validate(createTokenSchema), createToken)
  .delete(deleteToken);

export default router;

import { Router } from "express";
import { verifyToken, createToken, deleteToken } from "../controllers/tokens";
import { validate } from "../middlewares/validate";
import { createTokenSchema } from "../validators/tokenValidators";
import { authenticate } from "../middlewares/authenticate";

const router = Router();

router
  .route("/")
  .post(validate(createTokenSchema), createToken)
  .delete(deleteToken);

router.route("/check").get(authenticate, verifyToken);

export default router;

import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storageRouter from "./storage";
import certificatesRouter from "./certificates";
import usersRouter from "./users";
import portfolioRouter from "./portfolio";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storageRouter);
router.use(certificatesRouter);
router.use(usersRouter);
router.use(portfolioRouter);

export default router;

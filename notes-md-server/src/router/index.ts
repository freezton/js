import { Routes } from "@/constants/routes";
import { Router } from "express";
import AuthController from "@/controller/auth"
import NoteController from "@/controller/note"
import { authenticateToken } from '@/middleware';

const router = Router();

router.post(`${Routes.AUTH}/signup`, AuthController.signUp)
router.post(`${Routes.AUTH}/signin`, AuthController.signIn)
router.post(`${Routes.AUTH}/refresh`, AuthController.refreshAccessToken)
router.delete(`${Routes.AUTH}/revoke`, AuthController.revokeToken)

// router.get(`${Routes.NOTES}`, authenticateToken, NoteController.getAll)
// router.get(`${Routes.NOTES}/:id`, authenticateToken, NoteController.get)
// router.post(`${Routes.NOTES}`, authenticateToken, NoteController.create)
// router.put(`${Routes.NOTES}/:id`, authenticateToken, NoteController.update)
// router.delete(`${Routes.NOTES}/:id`, authenticateToken, NoteController.delete)

router.get(`${Routes.IMAGES}/:id`, authenticateToken, NoteController.getImage)
router.get(`${Routes.IMAGES}`, authenticateToken, NoteController.getAllImages)
router.post(`${Routes.IMAGES}`, authenticateToken, NoteController.uploadImage)
router.delete(`${Routes.IMAGES}/:id`, authenticateToken, NoteController.deleteImage)

export default router;

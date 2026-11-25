"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export async function registerUser(
    prevState: { error?: string },
    formData: FormData
) {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!name || !email || !password) {
        return { error: "Missing required fields" }
    }

    if (password.length < 6) {
        return {
            error: "Password must be at least 6 characters long"
        }
    }

    if (!email.includes("@")) {
        return {
            error: "Invalid email address"
        }
    }

    const existuser = await prisma.user.findUnique({
        where: { email }
    })

    if (existuser) {
        return {
            error: "Email sudah terdaftar"
        }
    }

    const hashPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
        data: { name, email, password: hashPassword }
    })

    redirect("/login")
}

export async function loginaction(
    prevState: { error?: string },
    formData: FormData
) {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
        return {
            error: "EMAIL DAN PASSWORD WAJIB DIISI"
        }
    }

    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user) {
        return {
            error: "EMAIL TIDAK TERDAFTAR"
        }
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        return {
            error: "PASSWORD SALAH"
        }
    }

    const session = await prisma.session.create({
        data: { userId: user.id }
    })

    const sessionPayload = JSON.stringify({
        id: user.id,
        sessionId: session.id,
        name: user.name,
        email: user.email,
        role: user.role,
        loginAt: new Date().toISOString(),
    })

    const cookieStore = await cookies()

    cookieStore.set("session", sessionPayload, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
        path: "/",
    })

    redirect("/dashboard")
}

export async function logoutAction() {
    const cookieStore = await cookies()

    cookieStore.delete("session")

    redirect("/login")
}

export async function getAuthUserId() {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")?.value

    if (!sessionCookie) {
        return null
    }

    try {
        const sessionPayload = JSON.parse(sessionCookie)
        return sessionPayload.id ?? null
    } catch {
        return null
    }
}


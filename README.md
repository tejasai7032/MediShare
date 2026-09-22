# 🏥 MediShare — Healthcare Resource Sharing Platform

MediShare is a full-stack healthcare resource-sharing platform designed to help healthcare organizations discover, manage, rent, and coordinate medical resources through a centralized web application.

The platform supports medical equipment, emergency resource requests, blood inventory information, and structured rental workflows.

---

## 🚀 Project Overview

Healthcare organizations may have medical resources that are temporarily unavailable to other organizations even when they are not actively being used.

MediShare provides a centralized platform where organizations can:

- Create organization accounts
- Manage healthcare resources
- Discover available resources
- Submit rental requests
- Approve and manage rental workflows
- Submit emergency resource requests
- Maintain blood inventory information
- Track resource availability
- Manage organization-specific resources
- Use role-based authentication and authorization

---

## ✨ Key Features

### 🔐 Authentication & Authorization

- User registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Role-based authorization
- Organization users
- Administrator users
- Protected API routes

### 🏥 Resource Management

Organizations can create and manage resources such as:

- OT Equipment
- Medical Equipment
- Ambulances
- Blood
- Hospital Beds
- Emergency Services

Resources contain information such as:

- Resource name
- Category
- Quantity
- Available quantity
- Location
- Contact information
- Rental availability
- Rental price
- Emergency availability

### 📦 Rental Management

MediShare implements a complete rental lifecycle:

```text
PENDING
   ↓
APPROVED
   ↓
DISPATCHED
   ↓
IN_USE
   ↓
RETURNED
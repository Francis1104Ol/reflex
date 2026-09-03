# Reflex — Delivery Operations Platform

Reflex is a role-based delivery operations platform designed to help
small retailers coordinate deliveries without relying entirely on
WhatsApp and phone calls.

The platform provides a centralized workflow for creating delivery
requests, assigning registered riders, tracking delivery status, and
maintaining delivery records.

## Live Application

**Production:**  
https://reflex-dbahe9o4p-the-nation.vercel.app

**API Documentation:**  
https://reflex-dbahe9o4p-the-nation.vercel.app/api-docs

**OpenAPI Specification:**  
https://reflex-dbahe9o4p-the-nation.vercel.app/api/openapi

---

## Problem

Small retailers often coordinate deliveries manually through WhatsApp
messages and phone calls.

This makes it difficult to know:

- Who is handling a delivery
- What stage the delivery is currently in
- Which rider was assigned
- Whether a delivery has actually been completed
- Where delivery records are stored

This lack of centralized visibility can make delivery operations
difficult to coordinate and monitor.

---

## Solution

Reflex provides a centralized delivery workflow connecting retailers,
dispatchers, and riders.

```text
Retailer
   |
   | Creates delivery request
   v
Dispatcher
   |
   | Assigns registered rider
   v
Rider
   |
   | Updates delivery status
   v
Delivered

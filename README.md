# Reflex — Delivery Operations Platform

Reflex is a role-based delivery operations platform designed to help
small retailers coordinate deliveries without relying entirely on
WhatsApp and phone calls.

## Problem

Small retailers often coordinate deliveries manually through WhatsApp
messages and phone calls. This makes it difficult to know:

- Who is handling a delivery
- What stage the delivery is currently in
- Which rider was assigned
- Whether a delivery has actually been completed
- Where delivery records are stored

## Solution

Reflex provides a centralized delivery workflow where:

Retailer
   ↓
Creates delivery request
   ↓
Dispatcher
   ↓
Assigns registered rider
   ↓
Rider
   ↓
Updates delivery status
   ↓
Delivered

## User Roles

### Retailer
- Create delivery requests
- View delivery records
- Track delivery status

### Dispatcher
- View pending deliveries
- View registered riders
- Assign riders to deliveries
- Monitor delivery operations

### Rider
- View assigned deliveries
- Pick up deliveries
- Start delivery
- Confirm delivery

## Delivery Status

PENDING
   ↓
ASSIGNED
   ↓
PICKED_UP
   ↓
IN_TRANSIT
   ↓
DELIVERED
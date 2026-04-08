
# 🚀 Co-Working Space Platform

<p align="center">
<img width="1898" height="912" alt="Screenshot 2026-04-08 115744" src="https://github.com/user-attachments/assets/86da3447-d5e2-4049-a56a-e259227c7813" />
</p>

<p align="center">
  <a href="https://coworkingspace-one.vercel.app/"><img src="https://img.shields.io/badge/Live%20Demo-Visit%20Now-0f172a?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" /></a>
  <img src="https://img.shields.io/badge/Frontend-React.js-61dafb?style=for-the-badge&logo=react&logoColor=000" alt="React" />
  <img src="https://img.shields.io/badge/Backend-Django%20REST-092e20?style=for-the-badge&logo=django&logoColor=white" alt="Django REST Framework" />
  <img src="https://img.shields.io/badge/Auth-JWT-f59e0b?style=for-the-badge" alt="JWT Authentication" />
  <img src="https://img.shields.io/badge/Database-MySQL%20%2B%20Aiven-2563eb?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL and Aiven" />
</p>

A full-stack **AI-powered co-working space booking platform** built with **React.js, Django REST Framework, MySQL, and JWT authentication**. It helps users discover premium workspaces, book instantly, submit special workspace requests, track their orders, and get smart workspace guidance through an AI assistant.

---

## 📌 Overview

This platform is designed for modern co-working businesses that need a complete digital workflow for **workspace discovery, booking, lead capture, customer follow-up, and role-based operations**.

It supports three major roles:
- **User** – browse spaces, book workspaces, send special requests, track orders, add reviews, and contact owners.
- **Owner** – manage assigned leads, contact interested users, and update lead status.
- **Admin** – manage users, owners, categories, workspaces, bookings, leads, and platform-level controls.

### 🌐 Live Demo
**Frontend:** https://coworkingspace-one.vercel.app/

---

## ✨ Highlights

- 🤖 AI workspace assistant for smarter discovery
- 🏢 Explore co-working spaces by city and location
- 🛒 Cart-based booking and checkout flow
- 📩 Lead capture and callback request system
- 👤 Admin, Owner, and User role-based dashboards
- 📦 My Orders tracking for bookings and special requests
- ⭐ Review and rating system for workspaces
- 📞 Owner contact via call, email, and WhatsApp
- 🔐 JWT authentication with protected routes
- 📱 Fully responsive UI for desktop, tablet, and mobile

---

## 🖼️ Project Preview

### Mainpage

<p align="center">
  <img width="1883" height="898" alt="image" src="https://github.com/user-attachments/assets/3592d544-2eca-4a7a-b477-f7bdd9815377" />

</p>



## 👥 User Features

### Browse & Discover
- Search co-working spaces by location
- Explore city-based listings
- View workspace images and details
- Check amenities and workspace type
- Discover premium locations like Gachibowli, Hitec City, Madhapur, and more

### Smart Booking Flow
- Book single-day workspace access
- Add multiple workspaces to cart
- Select booking date and duration
- View dynamic total pricing
- Checkout with booking confirmation
- Auto-clear cart after successful checkout

### Special Workspace Requests
- Submit custom workspace requirements
- Share contact details, company, and message
- Raise inquiries for categories like cabins, meeting rooms, fixed seats, or day passes
- Track request progress inside the user dashboard

### Account & Tracking
- Secure signup and login
- Track booking history in **My Orders**
- Track special request status updates
- Receive clear order and request visibility

### Contact & Assistance
- Get help through AI assistant
- Contact owner through phone, email, or WhatsApp
- Request callbacks for premium spaces
- Use a responsive, modern booking experience

---

## 🤖 AI Assistant Features

The AI assistant improves the user experience by helping visitors find the most relevant workspace faster.

### What it helps with
- Suggest workspace categories
- Recommend low-price or premium options
- Guide users based on team size or need
- Help users understand booking choices
- Answer workspace-related queries
- Improve discovery across available listings

### Example prompts
- **“Need meeting room”** → suggests meeting room options
- **“Cheap workspace”** → suggests budget-friendly choices
- **“Team workspace”** → suggests cabins or fixed seating options

---

## 🔐 Authentication & Security

- JWT-based authentication
- Secure login and registration flow
- Protected API endpoints
- Role-based route access
- Private dashboards for Admin and Owner
- Booking actions allowed only for authenticated users
- Token-based secure session handling

### Roles Supported
- **Admin**
- **Owner**
- **User**

---

## 👑 Admin Features

### User Management
- View all users
- Create, update, and delete users
- Assign roles and permissions
- Promote users to owner/admin access where required
- Monitor total platform users

### Owner Management
- Create and manage owner accounts
- Assign owners to workspace categories
- Update owner information
- View owner lead assignments
- Track owner engagement and responses

### Workspace Management
- Add workspace entries
- Update workspace details
- Delete workspaces
- Set workspace availability
- Upload workspace images
- Define location, category, and pricing
- Manage discount-related information

### Category Management
Admin can manage categories such as:
- Day Pass
- Meeting Rooms
- Fixed Seats
- Cabins

Admin operations include:
- Add category
- Edit category
- Delete category
- Enable or disable category
- Assign category owner
- Maintain pricing-related settings

### Leads Management
Admin can view and control:
- All captured leads
- User details
- Assigned owner
- Category information
- Phone, email, and company info
- Lead message and current status
- Status updates and overall tracking

---

## 👤 Owner Features

Owners get a focused dashboard to manage leads assigned to their categories.

### Owner Dashboard Capabilities
- View assigned leads
- Contact users directly
- Update lead status
- Track customer conversations
- Manage follow-up actions

### Contact Actions
- 📞 Call users
- 📧 Email users
- 💬 WhatsApp users

### Lead Status Options
- Pending
- Contacted
- Confirmed
- Cancelled

---

## 🧠 Special Request Workflow

```text
User browses platform
   ↓
Clicks Know More / Special Request
   ↓
Fills contact form
(Name, Phone, Email, Company, Message)
   ↓
Lead is created
   ↓
Admin assigns category owner
   ↓
Owner receives lead in dashboard
   ↓
Owner updates lead status
   ↓
User tracks status in My Orders
```

This workflow helps businesses convert inquiries into bookings while keeping users informed.

---

## 🛒 Booking System

The platform includes a full workspace booking pipeline.

### Booking Features
- Book workspace for a selected date
- Add to cart before checkout
- Dynamic total amount calculation
- Duration-aware booking flow
- Booking confirmation handling
- Clean order creation after checkout

---

## 📦 My Orders

Users can track both workspace bookings and special workspace requests from one place.

### Workspace Bookings include
- Workspace name
- Location
- Booking date
- Duration
- Price
- Booking status

### Special Requests include
- Category
- Company
- Message
- Current request status

---

## 📊 Leads Management System

This module is useful for customer acquisition and sales follow-up.

### Admin View
- View every platform lead
- Track owner assignment
- Monitor lead progress
- Review customer intent and message details

### Owner View
- Access only assigned category leads
- Contact interested users quickly
- Update request progress
- Maintain better conversions through follow-up

### User View
- Track request updates transparently
- See owner response progress
- Stay informed about confirmations or cancellations

---

## ⭐ Reviews & Ratings

Authenticated users can submit workspace reviews and ratings after their experience.

### Review Features
- Add textual feedback
- Give star rating
- Display reviews on the platform
- Improve trust and decision-making for other users

---

## 🧩 Amenities Covered

- WiFi
- Air Conditioning
- Parking
- Cafeteria
- Power Backup
- High-Speed Internet
- Meeting Rooms
- Security
- Coffee
- Lounge
- Printer access

---

## 🔎 Smart Search & Filters

Users can quickly narrow down the right workspace using smart discovery options.

### Filters Supported
- Location filter
- Price filter
- Rating filter
- Category filter
- Workspace type filter
- Amenity-based filtering
- AI-assisted suggestions

---

## 🎨 UI / UX Features

- Modern landing page design
- Premium hero banner section
- Responsive navbar with hamburger menu
- Clean cards and gallery layouts
- Smooth transitions and navigation
- Toast notifications
- Mobile-friendly booking journey
- Organized dashboards for each role

---

## 🏢 Role-Based Access Structure

### Admin
Controls users, owners, workspaces, categories, leads, assignments, and bookings.

### Owner
Manages assigned leads, contacts users, and updates request statuses.

### User
Browses workspaces, books spaces, sends special requests, tracks orders, and contacts owners.

---

## 🏗️ Tech Stack

### Frontend
- React.js
- Axios
- Bootstrap
- Custom CSS / responsive styling

### Backend
- Django
- Django REST Framework
- JWT Authentication
- Role-based permissions

### Database
- MySQL
- Aiven Cloud Database

### Deployment
- **Frontend:** Vercel
- **Backend:** Render

---

## 📂 Project Structure

```bash
co-working-platform/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── styles/
│
├── backend/
│   ├── workspace/
│   ├── leads/
│   ├── users/
│   ├── owners/
│   ├── cart/
│   └── auth/
```

---

## 🔄 Complete Platform Flow

```text
User → Browse Workspace
     → Add to Cart
     → Checkout
     → Booking Created

OR

User → Special Request
     → Admin Assigns Owner
     → Owner Receives Lead
     → Owner Updates Status
     → User Tracks in My Orders
```

---

## 🚀 Future Enhancements

- Online payment integration
- Booking calendar UI
- Real-time notifications
- Mobile app version
- Advanced admin analytics dashboard
- Google Maps integration improvements
- AI smart matching enhancements
- Multi-city and multi-language support
- Lead conversion analytics

---

## 💼 Business Value

This project is more than a workspace listing site. It acts as a full business management system for co-working operations.

### It helps businesses to
- Capture new leads efficiently
- Convert inquiries into bookings
- Manage owner-level sales follow-ups
- Organize bookings and customer data
- Deliver a better digital customer experience

---

## 👨‍💻 Author

**Tharun Katarapu**  
Python Full Stack Developer

---

## 📌 Why This Project Stands Out

- Combines **booking + lead generation + AI assistant** in one platform
- Supports **real-world multi-role operations**
- Includes both **business workflow** and **customer-friendly UI**
- Built with scalable technologies used in production-ready apps

---

## 📃 License

This project is created for learning, portfolio, and demonstration purposes.

---


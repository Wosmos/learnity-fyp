# Teacher Sessions & Communication Hub

## Overview

Currently, chat and video conferencing features are tied to courses only. We need to expand the Teacher Session page into a full communication hub where teachers have independent control over messaging, calls, and scheduled sessions with their students — outside the boundaries of any single course.

---

## Chat & Messaging

Teachers should be able to create group chats and one-on-one conversations with their students. The student pool available to a teacher should include all students enrolled across any of their courses — not limited to one course at a time. Teachers can name their group chats, add or remove members, and manage them freely. Students can participate in chats they've been added to and can message their teachers directly, but they cannot create group chats themselves.

Standard messaging features should be supported: text, media/file sharing, typing indicators, read receipts, reactions, threads, and the ability to pin messages. We are already using GetStream for chat, so this should be built on top of that.

---

## Video Conferencing & Calls

There should be two ways to start a video session:

**Instant Calls** — A teacher should be able to start a call directly from any chat (group or one-on-one). When a call is started, all members of that chat should be notified immediately so they can join. This works for both group calls and one-on-one calls. Standard call controls should be available: mute, camera toggle, screen share, and end call.

**Scheduled Sessions** — A teacher should be able to schedule a session in advance by setting a title, description, date/time, estimated duration, and selecting which students to invite. Sessions can be typed as a class, a one-on-one session, or a group meeting. Teachers should also have the option to make a session recurring (daily or weekly). Scheduled sessions should appear on a calendar view on the Teacher Session page, and students should see their upcoming sessions on their dashboard as well.

We are already using 100ms for video, so rooms should be created accordingly — on-demand for instant calls and pre-created for scheduled sessions.

---

## Push Notifications

Students need to be notified about communication activity so they don't miss anything. Notifications should be sent for the following events:

When a teacher creates a new group chat and adds students to it. When a new message is sent in a chat. When an instant call is started and students need to join. When a session is scheduled. When a scheduled session is about to start (a reminder roughly 15 minutes before). When a session goes live. When a session is cancelled or rescheduled.

Notifications should be delivered through multiple channels: in-app notifications (a notification center within the app), mobile push notifications (using FCM for Android and APNs for iOS), and web push notifications for browser users. For scheduled sessions, an optional email notification can also be sent.

Instant calls and live session alerts should be treated as high-priority/urgent notifications so they stand out from regular messages.

---

## Teacher Session Page

The Teacher Session page should be restructured to serve as the central hub for all of this. It should give the teacher easy access to their chats, their scheduled and past sessions, and any currently live sessions. Teachers should be able to quickly start an instant session, schedule a new one, or jump into a chat — all from this page. There should be a reusable student picker that shows all enrolled students grouped by course, so selecting participants is easy and consistent everywhere.

---

## Key Rules

Teachers can only communicate with students who are enrolled in their courses. Students cannot create group chats or schedule sessions — only teachers can. Instant calls should ring for a reasonable duration before timing out. Scheduled sessions should send a reminder notification before they start. A video session room should remain active until the teacher ends it. Each scheduled session should also have an associated chat channel so participants can discuss before and after the session.

---

## What We Already Have

- **100ms** — already integrated for video conferencing
- **GetStream** — already integrated for chat
- Existing course structure with teacher-student enrollment relationships
- Teacher Session page (needs to be expanded with these features)
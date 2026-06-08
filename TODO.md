# TODO - Admin dashboard (users/operators/tour plans delete)

- [ ] Implement real `/admin` dashboard UI in `tour-booking/app/admin/page.js` (users + operators lists)
- [ ] Add admin-only gate using `GET /api/auth/me`
- [ ] Wire API calls:
  - [ ] `GET /api/admin/users`
  - [ ] `GET /api/admin/operators`
  - [ ] `GET /api/admin/operators/:operatorId/tour-plans`
- [ ] Implement delete actions:
  - [ ] `DELETE /api/admin/users/:userId` and refresh lists
  - [ ] `DELETE /api/admin/operators/:operatorId` and refresh lists (assumes backend does cascading)
- [ ] Add loading/error states and confirmation for deletes
- [ ] Run and manually test `npm run dev` + verify admin listing and cascading delete


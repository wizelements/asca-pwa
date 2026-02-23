# Phase 3: Blockers & Remediation Plan

**Status:** Phase 1 & 2 complete, production live on Vercel.  
**Priority:** Fix critical security/config issues before Lighthouse audit.

---

## 1. RESEND_API_KEY Missing

### Current State
```env
# .env.local (PARTIAL - placeholder)
RESEND_API_KEY=re_your_resend_api_key_here
```

### Issue
- Email notifications (dues reminders, event updates) cannot send
- `app/api/dues/notify/route.ts` fails silently on Resend calls
- No transactional emails reach users

### Remediation
1. **Get Resend API Key:**
   - Login to https://resend.com/
   - Dashboard → API Keys → Copy key (format: `re_xxxxx`)

2. **Update .env.local:**
   ```bash
   RESEND_API_KEY=re_xxxx_your_actual_key_here
   ```

3. **Verify via CLI:**
   ```bash
   curl -X POST "https://api.resend.com/emails" \
     -H "Authorization: Bearer $RESEND_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"from":"admin@ascapwa.org","to":"test@example.com","subject":"Test","html":"<p>Test</p>"}'
   ```

4. **Add to Vercel Dashboard:**
   - Project Settings → Environment Variables
   - Add `RESEND_API_KEY`
   - Redeploy

### Timeline
- **Action:** 5 minutes to obtain & configure
- **Testing:** Manual email test to staging address
- **Verification:** Check Vercel logs for `[Resend] Email sent` messages

---

## 2. Default Admin Password Exposed

### Current State
```env
ADMIN_PASSWORD=AsCA2024!Secure  # Hardcoded, visible in threads
```

### Issue
- Default credentials in multiple threads & documentation
- Any user with thread access can access admin panel
- No password rotation policy

### Remediation
1. **Change Default Password (One-time Setup):**
   - Login to `/admin` with: `admin@ascapwa.org` / `AsCA2024!Secure`
   - Admin Settings → Change Password
   - Generate 16-char password: `openssl rand -base64 12`

2. **Rotate in Environment:**
   ```bash
   # .env.local (update only after first login)
   ADMIN_EMAIL=admin@ascapwa.org
   ADMIN_PASSWORD=<new_generated_password>  # Do not commit
   ```

3. **Vercel Security:**
   - Store in Vercel Secrets (not displayed in UI)
   - Use GitHub Secrets for CI/CD (if applicable)

4. **Document in Second Brain (Encrypted):**
   - Store new password in password manager (1Password, LastPass, etc.)
   - **Do not commit to git** (already in .gitignore)

### Timeline
- **Action:** 10 minutes
- **Verification:** Login with new password after Vercel redeploy

---

## 3. JWT Token Refresh Not Implemented

### Current State
- Bearer token validation in request headers
- No token expiration
- No refresh token mechanism

### Issue
- Sessions never expire (security risk)
- No protection against token theft/hijacking
- Doesn't follow OAuth2/OIDC best practices

### Remediation (Phase 3)
1. **Add Token Expiration (app/lib/auth/tokens.ts):**
   ```typescript
   const TOKEN_EXPIRY = 1000 * 60 * 60;  // 1 hour
   export function createToken(userId: string) {
     const expiresAt = Date.now() + TOKEN_EXPIRY;
     return { token, expiresAt };
   }
   ```

2. **Validate Expiration in API Routes:**
   ```typescript
   function validateToken(token: string) {
     const decoded = jwt.verify(token, NEXTAUTH_SECRET);
     if (decoded.exp < Date.now()) throw new Error('Token expired');
     return decoded;
   }
   ```

3. **Implement Refresh Endpoint (app/api/auth/refresh/route.ts):**
   ```typescript
   // POST /api/auth/refresh
   // Takes refresh token, returns new access token
   ```

4. **Client Integration:**
   - Store refresh token in httpOnly cookie (secure, not accessible to JS)
   - Intercept 401 responses → call refresh endpoint
   - Retry original request with new token

### Timeline
- **Complexity:** Medium (8-12 hours)
- **Priority:** Phase 3b (after Lighthouse audit)
- **Testing:** Jest + E2E token expiry scenarios

---

## 4. Firebase Config Optional (Phase 5)

### Current State
```env
# .env.local (not required for Phase 2-3)
# NEXT_PUBLIC_FIREBASE_API_KEY=
# NEXT_PUBLIC_FIREBASE_PROJECT_ID=
```

### Use Case
- Push notifications (Phase 5)
- Real-time member updates
- Event attendance tracking

### Action Required
- **None for Phase 3** — mark as optional
- **Phase 5:** Initialize Firebase project, add config

---

## 5. MongoDB Env Validation

### Current State
```env
MONGODB_URI=mongodb+srv://...  # Uses Atlas
```

### Verification Checklist
- [ ] Atlas cluster active (check https://cloud.mongodb.com/)
- [ ] Connection pooling enabled (Monitor → Connections)
- [ ] IP whitelist includes Vercel IPs (0.0.0.0/0 for now, restrict later)
- [ ] User has `readWrite` on target DB
- [ ] `.env.local` matches Vercel settings

### Test Connection
```bash
npm run test:db
```

Verify in `package.json`:
```json
{
  "scripts": {
    "test:db": "node -e \"require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('✅ Connected')).catch(err => console.error('❌', err))\""
  }
}
```

---

## 6. TypeScript Build Status

### Current Build Time
- **Phase 2:** 19.6 seconds
- **Target Phase 3:** <20 seconds

### Known Warnings (Non-blocking)
- `<img>` tags should use `next/image` (refactor in Phase 4)
- Unescaped HTML entities in blog content (sanitize later)
- `@ts-ignore` in Web Vitals monitor (acceptable for external lib)

### Remediation
- Run `pnpm typecheck` before every commit
- Fix errors before deploying

---

## Execution Roadmap

| Task | Effort | Blocker? | Phase | Status |
|------|--------|----------|-------|--------|
| Get RESEND_API_KEY | 5 min | ⚠️ Medium | 3 | ⏳ Pending |
| Change admin password | 10 min | 🔴 High | 3 | ⏳ Pending |
| Run Lighthouse audit | 15 min | ⚠️ Medium | 3 | ⏳ Pending |
| Test PWA install (manual) | 30 min | ⚠️ Medium | 3 | ⏳ Pending |
| Monitor Core Web Vitals | Ongoing | ⚠️ Medium | 3 | ⏳ In progress |
| Implement token refresh | 8-12 hrs | 🟢 Low | 3b | 📋 Planned |

---

## Next Steps

1. **Today:** Fix RESEND_API_KEY + admin password + Lighthouse audit
2. **Tomorrow:** PWA installation testing on real devices
3. **This week:** Core Web Vitals optimization (image lazy loading, code splitting)
4. **Next week:** Phase 3b (token refresh, admin UI rich editors)

---

## Validation Checklist

Before moving to Phase 4, verify:
- [ ] Lighthouse PWA score >= 90
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] Emails send successfully (RESEND_API_KEY working)
- [ ] Admin password changed and tested
- [ ] No console errors in Chrome DevTools
- [ ] PWA installable on Android + iOS
- [ ] Offline mode works (Service Worker caching)
- [ ] All API endpoints return 200/201/204 (no 500s)

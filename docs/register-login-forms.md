# Register & Login Forms

## Stack

`react-hook-form` for form state/submission + `zod` (via `@hookform/resolvers/zod`) for validation. Schemas live in `src/schemas/authSchemas.ts` — `registerSchema` and `loginSchema` — and are the single source of truth for validation rules; both the resolver and the on-blur availability checks reuse them (e.g. `registerSchema.shape.username.safeParse(value)`).

## Register flow (`components/auth/RegisterForm.tsx`)

1. **Per-field availability check on blur.** When the username or mobile field loses focus, if it already passes its own zod rule, the form calls `userApi.checkUsernameAvailability` / `checkMobileAvailability` (both hit the backend's `POST /user/validate-sign-up`). If taken, a manual error is set via `setError(field, { type: "manual", message: ... })`. This mirrors what the backend's `ValidateSignUpDto` (username OR mobile, not both at once) was built for — it's meant to be called once per field, not as a full-form pre-check.
2. Editing a field after a manual "already taken" error clears it (`onChange: () => clearErrors(field)`), so the message doesn't linger once the user starts fixing it.
3. **On submit**, the form calls `useAuth().register(values)` → `registerUser` thunk → `POST /user/sign-up`. On success: toast + redirect to `/login` (there's no auto-login after registering — matches the existing "Already a user? Login" link in the UI). On failure: the backend's error message is toasted.

## Login flow (`components/auth/LoginForm.tsx`)

Single `identifier` field (username **or** mobile number — the backend figures out which by checking if it's all digits) + `password`. On submit, calls `useAuth().login(values)` → `POST /auth/login` → on success, navigates to `/home`.

## Country code

The mobile field's country code is fixed at `+91` (India) — it's rendered as a read-only decorative input and carried separately as a hidden, registered form field (`<input type="hidden" {...register("countryCode")} />`) so it's included in the submitted payload without being user-editable. If the app needs to support other countries later, replace the hidden field with a real `<select>` and update `registerSchema.countryCode`'s validation accordingly (currently just `/^\d{2}$/`, i.e. any 2-digit code — the backend doesn't validate that the code corresponds to a real country either).

## Adding a new field to the register form

1. Add it to `registerSchema` in `authSchemas.ts` with the validation rule.
2. Add it to `SignUpPayload` in `src/api/userApi.ts` and to the backend's `SignUpDto` (`chatee-be/src/modules/user/dto/user.dto.ts`) — both sides validate independently, so they need to agree.
3. Add the `<input {...register("fieldName")} />` and its error message in `RegisterForm.tsx`.
4. Add a default in `useForm`'s `defaultValues`.

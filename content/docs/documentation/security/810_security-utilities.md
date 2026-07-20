---
title: "Security utilities"
slug: "security-utilities"
description: "Pionia Security class and helpers for passwords, tokens, OTPs, hashing, and encryption."
summary: "Use security() and secure_* helpers for cryptography instead of rolling your own."
date: 2026-07-01
lastmod: 2026-07-04
draft: false
weight: 802
toc: true
doc_type: reference
parent: "security"
seo:
  title: "Pionia security utilities"
  description: "security(), secure_token(), encrypt(), and public-key encryption in Pionia v3."
  noindex: false
---

## Who this is for

You are implementing Pionia Shop **`customer.login`** (password hashing with `hash_password()`), issuing session tokens after JWT sign-in, or sealing sensitive columns — and want the built-in **`security()`** helpers instead of ad-hoc crypto.

## What you will learn

- Which `secure_*` helper to use for passwords, API keys, OTPs, and encryption
- How `APP_KEY` and PHP extensions (`ext-sodium`, `ext-openssl`) fit together
- Validation rules (`otp`, `token`, `ulid`) that pair with security validators

## Before you start

{{< prerequisites >}}
- Booted app (`php pionia serve` on port **8000**)
- [JWT authentication](/documentation/security/jwt-authentication/) — Bearer tokens with `jwt_encode()` / `JwtAuthentication`
- [Authentication & authorization](/documentation/security/security-authentication-and-authorization/) — where backends and `mustAuthenticate()` fit
- `ext-sodium` enabled for `encrypt()` / `decrypt()` (check `php -m`)
{{< /prerequisites >}}

## How it works

Pionia ships a single **`Pionia\Security\Security`** class on the application container. Global helpers mirror every public method — use `security()->token()` or `secure_token()` interchangeably after boot.

{{< mermaid >}}
flowchart LR
  Login["customer.login"] --> Hash["hash_password() / verify_password()"]
  Token["API session"] --> ST["secure_token()"]
  OTP["Email reset code"] --> OTPH["secure_otp() + otp rule"]
  AtRest["Encrypted column"] --> Enc["encrypt() with APP_KEY"]
{{< /mermaid >}}

```php
$token = security()->token();
$token = secure_token(); // same result
```

{{< callout context="note" title="Boot required" icon="outline/information-circle" >}}
Helpers like `security()` require a booted application (`bootstrap/application.php`). For one-off scripts, call `AppRealm::create()` first or use the class directly: `(new Security())->token()`.
{{< /callout >}}

## Requirements

| Feature | PHP extension |
|---------|----------------|
| `encrypt()` / `decrypt()`, libsodium box, `keyPair()` | `ext-sodium` |
| `rsaEncrypt()` / `rsaDecrypt()` (hybrid large payloads) | `ext-openssl` + `ext-sodium` |
| Password hashing, HMAC, random bytes | core PHP |

Set `APP_KEY` in `environment/.env` for symmetric encryption (supports `base64:…` prefix):

```bash
php pionia shell
```

```php
'base64:' . secure_random_base64(32, false);
```

```ini
# environment/.env
APP_KEY=base64:paste-the-value-here
```

For scripts without a booted app, `(new Security())->randomHex(32)` and `(new Security())->randomBase64(32, false)` work the same way — no OpenSSL CLI required.

## Random data and identifiers

| Helper | `security()` method | Purpose |
|--------|---------------------|---------|
| `secure_random_bytes($length)` | `randomBytes()` | Raw CSPRNG bytes |
| `secure_random_string($length, $alphabet?)` | `randomString()` | Random string from a custom alphabet |
| `secure_random_hex($bytes = 16)` | `randomHex()` | Hex-encoded random bytes |
| `secure_random_base64($bytes = 32, $urlSafe = true)` | `randomBase64()` | Base64 (optionally URL-safe) |
| `secure_uuid()` | `uuid()` | UUID v4 |
| `secure_ulid()` | `ulid()` | Sortable ULID |
| `secure_otp($length = 6, $numericOnly = true)` | `otp()` | One-time code (4–20 chars) |
| `secure_token($bytes = 32)` | `token()` | URL-safe API/session token |
| `secure_secret($bytes = 32)` | `secret()` | Alias of `secure_token()` |
| `secure_password($length = 16, $symbols = true)` | `password()` | Random password matching the `password` validation rule |
| `csrf_token($bytes = 32)` | `csrfToken()` | CSRF token (alias of `token()`) |

Alphabet constants on the class: `Security::ALPHABET_LOWER`, `ALPHABET_UPPER`, `ALPHABET_NUMERIC`, `ALPHABET_ALPHANUMERIC`, `ALPHABET_HEX`, `ALPHABET_SYMBOLS`.

### Examples

```php
$apiKey = secure_secret(32);
$code = secure_otp(8);              // 8-digit numeric OTP
$invite = secure_ulid();
$resetToken = secure_token(48);

// Custom alphabet
$pin = secure_random_string(6, Security::ALPHABET_NUMERIC);
```

## Password hashing

| Helper | Method | Purpose |
|--------|--------|---------|
| `hash_password($password, $options = [])` | `hashPassword()` | Store bcrypt/argon hash |
| `verify_password($password, $hash)` | `verifyPassword()` | Check login |
| `password_needs_rehash($hash)` (PHP built-in) or `security()->needsRehash()` | `needsRehash()` | Upgrade algorithm on login |

Pionia Shop `customer.login` — verify without leaking hashes in the response:

```php
$hash = hash_password($plain);
if (verify_password($plain, $user->password_hash)) {
  if (password_needs_rehash($user->password_hash)) {
    table('customers')->update($user->id, ['password_hash' => hash_password($plain)]);
  }
}
```

Never return password hashes in API `returnData`. Pair with the `password` validation rule — see [Validations](/documentation/building-api/validation/).

## Hashing and comparison

| Helper | Method | Purpose |
|--------|--------|---------|
| `secure_hash($data, $algo = 'sha256')` | `hash()` | One-way digest |
| `secure_hmac($data, $key, $algo = 'sha256')` | `hmac()` | Message authentication code |
| `verify_hmac($data, $key, $expected, $algo = 'sha256')` | `verifyHmac()` | Timing-safe HMAC check (hex or binary) |
| `secure_equals($known, $user)` | `equals()` | Timing-safe string compare |

```php
$signature = secure_hmac($payload, env('WEBHOOK_SECRET'));
if (!verify_hmac($payload, env('WEBHOOK_SECRET'), $request->headers->get('X-Signature'))) {
  return response(401, 'Invalid signature');
}

if (!secure_equals($storedToken, $submittedToken)) {
  return response(403, 'Forbidden');
}
```

## Symmetric encryption (shared secret)

Encrypt sensitive values at rest with `APP_KEY` or an explicit key:

```php
$encrypted = encrypt('sensitive payload');
$plain = decrypt($encrypted);

// Explicit key (32+ bytes or base64: prefix)
$key = secure_random_bytes(32);
$blob = encrypt($json, $key);
$json = decrypt($blob, $key);
```

Payload format: base64(`nonce` + `ciphertext`) using libsodium secretbox.

## Public-key encryption (libsodium box)

X25519 key pairs are returned **base64-encoded**:

| Helper | Method | Purpose |
|--------|--------|---------|
| `security_key_pair()` | `keyPair()` | Generate `{ public_key, private_key }` |
| `encrypt_with_public_key($plain, $publicKey)` | `encryptWithPublicKey()` | Seal — encrypt with public key only |
| `decrypt_with_private_key($payload, $publicKey, $privateKey)` | `decryptWithPrivateKey()` | Open sealed message |
| `encrypt_for_recipient($plain, $recipientPublic, $senderPrivate)` | `encryptForRecipient()` | Authenticated sender → recipient |
| `decrypt_from_sender($payload, $senderPublic, $recipientPrivate)` | `decryptFromSender()` | Decrypt authenticated message |
| `public_key_from_private($privateKey)` | `publicKeyFromPrivateKey()` | Derive public key |

### Seal (anonymous sender)

Anyone with the public key can encrypt; only the holder of the private key can decrypt:

```php
$keys = security_key_pair();

$encrypted = encrypt_with_public_key('secret', $keys['public_key']);
$plain = decrypt_with_private_key($encrypted, $keys['public_key'], $keys['private_key']);
```

### Authenticated box (known sender)

```php
$alice = security_key_pair();
$bob = security_key_pair();

$encrypted = encrypt_for_recipient('hello bob', $bob['public_key'], $alice['private_key']);
$plain = decrypt_from_sender($encrypted, $alice['public_key'], $bob['private_key']);
```

## RSA (PEM keys)

For interoperability with external systems that expect standard PEM RSA keys:

| Helper | Method | Purpose |
|--------|--------|---------|
| `rsa_key_pair($bits = 2048)` | `rsaKeyPair()` | Generate PEM `{ public_key, private_key }` |
| `rsa_encrypt($plain, $publicKeyPem)` | `rsaEncrypt()` | RSA-OAEP (hybrid for large messages) |
| `rsa_decrypt($payload, $privateKeyPem)` | `rsaDecrypt()` | Decrypt RSA payload |

```php
$keys = rsa_key_pair();
$encrypted = rsa_encrypt('any size message', $keys['public_key']);
$plain = rsa_decrypt($encrypted, $keys['private_key']);
```

Minimum key size is **2048** bits. Small messages use direct RSA-OAEP; larger payloads wrap a symmetric key with secretbox.

## Validators

Static checks on the `Security` class — also exposed as helpers:

| Helper | Method | Checks |
|--------|--------|--------|
| `is_uuid($value)` | `isUuid()` | UUID v4 format |
| `is_ulid($value)` | `isUlid()` | 26-char Crockford ULID |
| `is_otp($value, $length = 6, $numericOnly = true)` | `isOtp()` | OTP length and charset |
| `is_token($value, $minBytes = 16)` | `isToken()` | Hex or URL-safe base64 entropy |

Use in validation pipes and chains:

```php
rules($data, [
  'session_id' => 'required|uuid',
  'request_id' => 'required|ulid',
  'code' => 'required|otp:6',
  'api_token' => 'required|token:24',
]);

validate('code', $data)->asOtp(8);
validate('token', $data)->asToken(16);
validate('id', $data)->ulid();
```

See [Validations](/documentation/building-api/validation/) for the full rule list.

## Choosing an approach

| Use case | Recommendation |
|----------|----------------|
| API keys, session IDs, reset tokens | `secure_token()` / `secure_secret()` |
| Email/SMS OTP | `secure_otp($length)` + `otp` validation rule |
| User passwords | `hash_password()` / `verify_password()` + `password` rule |
| Webhook signatures | `secure_hmac()` / `verify_hmac()` |
| Compare secrets in constant time | `secure_equals()` |
| Encrypt DB column with app master key | `encrypt()` / `decrypt()` + `APP_KEY` |
| Encrypt for one recipient (no sender identity) | `encrypt_with_public_key()` |
| Encrypt between two known parties | `encrypt_for_recipient()` |
| Exchange with third-party PEM RSA | `rsa_encrypt()` / `rsa_decrypt()` |

## Common mistakes

- Using `md5()` or plain `sha256()` for passwords — use `hash_password()` / `verify_password()` only
- Calling `encrypt()` without `APP_KEY` set — symmetric crypto fails at runtime
- Comparing tokens with `===` when timing attacks matter — use `secure_equals()` or `verify_hmac()`
- Returning OTPs or reset tokens in logs — redact via `[logging] HIDE_IN_LOGS`

## What's next

{{< card-grid >}}
{{< link-card title="Authentication & authorization" description="Wire JWT backends and mustAuthenticate()." href="/documentation/security/security-authentication-and-authorization/" >}}
{{< link-card title="Validations" description="otp, token, ulid, uuid rules." href="/documentation/building-api/validation/" >}}
{{< link-card title="Helpers reference" description="All global helpers including security()." href="/documentation/extending/helpers/" >}}
{{< /card-grid >}}

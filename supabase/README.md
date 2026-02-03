# Supabase Backend

## Apply migrations

```bash
supabase db push
```

## Deploy edge functions

```bash
supabase functions deploy progression-get-state
supabase functions deploy progression-complete
supabase functions deploy billing-webhook-revenuecat
supabase functions deploy account-delete
```

## Local test invocation examples

```bash
supabase functions invoke progression-get-state --no-verify-jwt --body '{}'
supabase functions invoke progression-complete --no-verify-jwt --body '{"seqIndex":1,"response":{"responses":[{"promptId":"reflection","value":"ok"}]}}'
```

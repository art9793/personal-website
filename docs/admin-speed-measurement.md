# Admin Speed Measurement

Use this checklist to compare baseline vs post-change admin performance.

## Test Scenarios

1. Open `/admin?tab=writing`.
2. Filter articles using the search input.
3. Publish one draft article.
4. Bulk publish 5+ draft articles.
5. Bulk delete 3+ articles.

## How To Measure

- Run each scenario 5 times on the same network/browser session.
- Record the duration shown in admin toasts (for save/publish/bulk operations).
- For tab load/filter, use browser devtools Performance panel and capture interaction time.
- Compute median per scenario and compare before/after.

## Target

- Median publish/edit workflow duration improves by 30%+.
- Writing list interactions remain smooth while filtering large article sets.

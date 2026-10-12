<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

Keep all public, member, and admin theme switching in the shared ThemeToggle and global semantic CSS tokens; this keeps both presentations visually consistent and the choice persistent.
Use bundled editorial event images through EventItem.image and EventImage; this keeps event visuals available without external image dependencies.
Scope customer presentation tokens and typography to the shared SitePage wrapper; this permits a distinct customer identity without altering admin styling or store behavior.
Keep customer editorial interactions in CustomerExperience and information views in CustomerInfo, using the existing store; this isolates presentation-only redesigns from admin operations.
Use WhatsAppAction for event sharing without inventing a business phone number; this keeps outbound event links consistent until an approved team contact is supplied.
Measure banner scroll progress from the sticky frame's actual height and top offset, and update on scroll and resize; this keeps story navigation aligned across viewport sizes.
Use a cropped transparent derivative of the supplied logo for customer branding and a padded square derivative for the favicon; this preserves the original lettering without oversized empty margins.
Serve the customer banner clip as WebM (VP9) from a Lovable Assets pointer using its relative URL; this keeps it playable in Chromium-based preview browsers, which reject the generated H.264 MP4, and portable between preview and published hosts.
Use the shared PasswordInput from ui-kit for every password field and keep the recovery flow at /forgot-password then /reset-password; this gives one show/hide behaviour and a clickable reset path without a real mail service.


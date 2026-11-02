# Data Model

```
users (1) ────< spaces (1) ────< testimonials
admins (separate, no relation)
```

```mermaid
erDiagram
    USERS ||--o{ SPACES : owns
    SPACES ||--o{ TESTIMONIALS : receives
    USERS {
        int id PK
        varchar email UK
        varchar password
        varchar name
        varchar company
        varchar profile_image
        boolean is_banned
    }
    ADMINS {
        int id PK
        varchar email UK
        varchar password
        varchar name
    }
    SPACES {
        int id PK
        int owner_id FK
        varchar slug UK
        varchar name
        varchar logo
        varchar header_title
        text custom_message
        jsonb questions
        boolean collect_text
        boolean collect_video
        boolean collect_star_rating
        boolean collect_email
        boolean collect_company
        boolean collect_job_title
        boolean collect_photo
        varchar thank_you_title
        text thank_you_message
        varchar button_color
        boolean is_active
        enum wall_theme
        enum wall_layout
        boolean wall_show_rating
        boolean wall_show_date
        boolean wall_show_branding
    }
    TESTIMONIALS {
        int id PK
        int space_id FK
        enum type
        varchar name
        varchar email
        varchar job_title
        varchar company
        varchar photo
        varchar video
        smallint rating
        text message
        boolean consent
        enum source
        boolean is_liked
        boolean is_archived
        timestamp created_at
    }
```

## Relationships and rules
- A user owns many spaces; deleting the user deletes their spaces (`ON DELETE CASCADE`).
- A space has many testimonials; deleting the space deletes them (`ON DELETE CASCADE`).
- `spaces.slug` is unique and is the public URL part (`/s/:slug`, `/w/:slug`).
- `testimonials.type`: `text` or `video`. `source`: `collected` (public form) or `imported` (added by owner).
- Wall = testimonials where `is_liked = true` and `is_archived = false`. Archiving sets `is_liked = false`.
- `testimonials.email` is private and never returned by public endpoints.
- Full column details: `database/schema.sql` and `docs/SRS.md` section 6.

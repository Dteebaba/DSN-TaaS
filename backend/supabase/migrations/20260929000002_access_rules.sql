-- DSN Talent Platform: who can see and change what (Row Level Security)
-- Rule of thumb:
--   * Anyone (even logged out) sees the anonymised directory: DSN ID, masked name, roles, rating.
--   * Subscribed recruiters, reviewers and admins see full profiles, never contact details.
--   * Contact details (email/phone) are visible to the member themselves and admins only.
--   * Reviewers write review decisions; admins can do everything.

-- ---------- identity helpers ----------
create or replace function current_kind() returns account_kind
language sql stable security definer set search_path = public as $$
  select kind from accounts where user_id = auth.uid()
$$;
create or replace function current_ref() returns text
language sql stable security definer set search_path = public as $$
  select ref_id from accounts where user_id = auth.uid()
$$;
create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(current_kind() = 'admin', false)
$$;
create or replace function is_reviewer() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from reviewers r where r.user_id = auth.uid() and r.active)
$$;
create or replace function is_subscribed_recruiter() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from recruiters r where r.user_id = auth.uid()
                 and r.status = 'approved' and r.subscribed
                 and (r.subscribed_until is null or r.subscribed_until >= current_date))
$$;
create or replace function can_see_full_profiles() returns boolean
language sql stable as $$ select is_admin() or is_reviewer() or is_subscribed_recruiter() $$;

-- ---------- public directory (anonymised) ----------
create or replace view public_talent with (security_barrier = true) as
select m.dsn_id,
       mask_name(m.full_name)       as display_name,
       m.headline, m.location, m.skills, m.open_to_work,
       m.score_tech, m.score_projects, m.score_experience, m.score_education, m.score_soft,
       member_total(m)              as rating,
       m.score_status, m.reviewed_at,
       (select coalesce(jsonb_agg(jsonb_build_object('role', r.role, 'level', r.level, 'status', r.status, 'verified_at', r.verified_at)
                                  order by (r.status = 'verified') desc, r.level desc), '[]'::jsonb)
          from member_roles r where r.dsn_id = m.dsn_id) as roles,
       (select count(*) from member_experience e where e.dsn_id = m.dsn_id)     as experience_count,
       (select count(*) from member_projects p where p.dsn_id = m.dsn_id)       as project_count,
       m.created_at
from members m
where m.visible;
grant select on public_talent to anon, authenticated;

-- ---------- enable RLS everywhere ----------
alter table role_catalog            enable row level security;
alter table role_level_descriptions enable row level security;
alter table dsn_programmes          enable row level security;
alter table settings                enable row level security;
alter table accounts                enable row level security;
alter table applications            enable row level security;
alter table members                 enable row level security;
alter table member_contacts         enable row level security;
alter table member_experience       enable row level security;
alter table member_projects         enable row level security;
alter table member_education        enable row level security;
alter table member_certifications   enable row level security;
alter table member_roles            enable row level security;
alter table impact_updates          enable row level security;
alter table reviewers               enable row level security;
alter table recruiters              enable row level security;
alter table review_requests         enable row level security;
alter table review_request_roles    enable row level security;
alter table review_request_history  enable row level security;
alter table talent_requests         enable row level security;
alter table profile_views           enable row level security;

-- ---------- reference data: readable by all, editable by admin ----------
create policy "read role catalog"   on role_catalog            for select using (true);
create policy "read level text"     on role_level_descriptions for select using (true);
create policy "read programmes"     on dsn_programmes          for select using (true);
create policy "read public settings" on settings               for select using (true);
create policy "admin role catalog"  on role_catalog            for all using (is_admin()) with check (is_admin());
create policy "admin level text"    on role_level_descriptions for all using (is_admin()) with check (is_admin());
create policy "admin programmes"    on dsn_programmes          for all using (is_admin()) with check (is_admin());
create policy "admin settings"      on settings                for all using (is_admin()) with check (is_admin());

-- ---------- accounts ----------
create policy "see own account" on accounts for select using (user_id = auth.uid() or is_admin());
create policy "admin accounts"  on accounts for all using (is_admin()) with check (is_admin());

-- ---------- applications: anyone may apply; only admin reads ----------
create policy "anyone can apply"     on applications for insert to anon, authenticated with check (status = 'pending');
create policy "admin reads apps"     on applications for select using (is_admin());
create policy "admin decides apps"   on applications for update using (is_admin()) with check (is_admin());

-- ---------- members ----------
create policy "member reads self"       on members for select using (user_id = auth.uid());
create policy "full profiles"           on members for select using (can_see_full_profiles());
create policy "member edits own cv"     on members for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "admin members"           on members for all using (is_admin()) with check (is_admin());
create policy "reviewer updates scores" on members for update using (is_reviewer()) with check (is_reviewer());
-- Members may not change their own scores or premium flag; enforced by trigger below.

create policy "contacts: self or admin" on member_contacts for select using (is_admin() or dsn_id = (select dsn_id from members where user_id = auth.uid()));
create policy "contacts: admin writes"  on member_contacts for all using (is_admin()) with check (is_admin());

-- CV sections: owner edits; full-profile viewers read
do $$ declare t text; begin
  foreach t in array array['member_experience','member_projects','member_education','member_certifications'] loop
    execute format('create policy "cv read" on %I for select using (can_see_full_profiles() or dsn_id = (select dsn_id from members where user_id = auth.uid()))', t);
    execute format('create policy "cv owner writes" on %I for all using (dsn_id = (select dsn_id from members where user_id = auth.uid())) with check (dsn_id = (select dsn_id from members where user_id = auth.uid()))', t);
    execute format('create policy "cv admin" on %I for all using (is_admin()) with check (is_admin())', t);
  end loop; end $$;

-- Roles: public (they appear in the directory). Members add claims only; reviewers/admin verify.
create policy "roles readable"      on member_roles for select using (true);
create policy "member claims role"  on member_roles for insert with check (status = 'claimed' and dsn_id = (select dsn_id from members where user_id = auth.uid()));
create policy "member removes claim" on member_roles for delete using (status <> 'verified' and dsn_id = (select dsn_id from members where user_id = auth.uid()));
create policy "reviewer sets roles" on member_roles for all using (is_reviewer() or is_admin()) with check (is_reviewer() or is_admin());

create policy "impact: self or admin" on impact_updates for select using (is_admin() or dsn_id = (select dsn_id from members where user_id = auth.uid()));
create policy "impact: member adds"   on impact_updates for insert with check (dsn_id = (select dsn_id from members where user_id = auth.uid()));
create policy "impact: admin"         on impact_updates for all using (is_admin()) with check (is_admin());

-- ---------- reviewers & recruiters ----------
create policy "reviewer self"      on reviewers  for select using (user_id = auth.uid() or is_admin());
create policy "admin reviewers"    on reviewers  for all using (is_admin()) with check (is_admin());
create policy "recruiter register" on recruiters for insert to anon, authenticated with check (status = 'pending' and not subscribed);
create policy "recruiter self"     on recruiters for select using (user_id = auth.uid() or is_admin());
create policy "recruiter asks sub" on recruiters for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "admin recruiters"   on recruiters for all using (is_admin()) with check (is_admin());

-- ---------- review requests ----------
create policy "member sees own requests" on review_requests for select using (dsn_id = (select dsn_id from members where user_id = auth.uid()));
create policy "member creates request"   on review_requests for insert with check (status = 'submitted' and reviewer_id is null and dsn_id = (select dsn_id from members where user_id = auth.uid()));
create policy "reviewer queue" on review_requests for select using (
  is_reviewer() and (reviewer_id is null or reviewer_id = current_ref())
  and ((type = 'role' and (select can_role from reviewers where user_id = auth.uid()))
    or (type = 'rating' and (select can_rating from reviewers where user_id = auth.uid()))));
create policy "reviewer decides" on review_requests for update using (is_reviewer() and (reviewer_id is null or reviewer_id = current_ref())) with check (reviewer_id = current_ref());
create policy "admin requests"   on review_requests for all using (is_admin()) with check (is_admin());

create policy "request roles read" on review_request_roles for select using (exists (select 1 from review_requests q where q.id = request_id));
create policy "request roles member add" on review_request_roles for insert with check (exists (select 1 from review_requests q where q.id = request_id and q.dsn_id = (select dsn_id from members where user_id = auth.uid())));
create policy "request roles reviewer" on review_request_roles for all using (is_reviewer() or is_admin()) with check (is_reviewer() or is_admin());

create policy "history read"  on review_request_history for select using (exists (select 1 from review_requests q where q.id = request_id));
create policy "history write" on review_request_history for insert with check (exists (select 1 from review_requests q where q.id = request_id));

-- ---------- partner requests & views ----------
create policy "partner own requests" on talent_requests for select using (recruiter_id = current_ref() or is_admin());
create policy "partner creates"      on talent_requests for insert with check (
  recruiter_id = current_ref() and status = 'new'
  and (cardinality(specific_members) = 0 or is_subscribed_recruiter()));
create policy "admin talent requests" on talent_requests for all using (is_admin()) with check (is_admin());

create policy "views: subscriber logs" on profile_views for insert with check (is_subscribed_recruiter() and recruiter_id = current_ref());
create policy "views: subscriber bumps" on profile_views for update using (is_subscribed_recruiter() and recruiter_id = current_ref());
create policy "views: premium member reads" on profile_views for select using (
  is_admin() or recruiter_id = current_ref()
  or exists (select 1 from members m where m.dsn_id = profile_views.dsn_id and m.user_id = auth.uid() and m.premium));
-- Non-premium members get only a count, through this function:
create or replace function my_profile_view_count() returns int
language sql stable security definer set search_path = public as $$
  select coalesce(sum(view_count),0)::int from profile_views v
  join members m on m.dsn_id = v.dsn_id where m.user_id = auth.uid()
$$;

-- ---------- guard: members cannot edit protected fields ----------
create or replace function guard_member_fields() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if is_admin() then return new; end if;
  if is_reviewer() then
    -- reviewers may only change scores and review status
    new.full_name := old.full_name; new.premium := old.premium; new.visible := old.visible;
    return new;
  end if;
  if new.user_id = auth.uid() then
    new.score_tech := old.score_tech; new.score_projects := old.score_projects;
    new.score_experience := old.score_experience; new.score_education := old.score_education;
    new.score_soft := old.score_soft; new.reviewed_at := old.reviewed_at;
    new.premium := old.premium; new.dsn_id := old.dsn_id; new.user_id := old.user_id;
    if new.score_status = 'reviewed' and old.score_status <> 'reviewed' then new.score_status := old.score_status; end if;
  end if;
  return new;
end $$;
create trigger members_guard before update on members for each row execute function guard_member_fields();

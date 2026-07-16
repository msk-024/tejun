-- 履歴記録を DB トリガーに移す（🔴2）
--
-- 実行方法: Supabase ダッシュボード → SQL Editor → New query に全文貼り付け → Run
--
-- 効果:
--   1. procedures / categories の INSERT・UPDATE で履歴が自動記録される（本体と同一トランザクション）
--   2. histories への直接 INSERT 権限を authenticated / anon から剥奪し、履歴の偽造を封じる
--
-- 適用後、アプリ側の手動 INSERT は権限エラーになるが現状エラーを無視しているため無害。
-- 二重記録もダウンタイムも発生しない。詳細は PLAN.md 参照。

-- ============================================================
-- 1. 手順書の履歴トリガー
-- ============================================================
create or replace function public.log_procedure_history()
returns trigger
language plpgsql
security definer            -- INSERT 権限を剥奪した後もトリガーだけは書けるようにする
set search_path = public    -- SECURITY DEFINER の定石。検索パス注入を防ぐ
as $$
begin
  insert into public.procedure_histories
    (procedure_id, title, content, category_id, changed_by, action)
  values (
    new.id,
    new.title,
    new.content,
    new.category_id,
    coalesce(auth.uid(), new.updated_by),   -- 実行ユーザー。アプリが詐称できない
    case
      when tg_op = 'INSERT'                     then 'created'
      when new.is_deleted and not old.is_deleted then 'deleted'
      else                                           'updated'
    end
  );
  return new;
end;
$$;

drop trigger if exists trg_procedure_history on public.procedures;
create trigger trg_procedure_history
  after insert or update on public.procedures
  for each row execute function public.log_procedure_history();

-- ============================================================
-- 2. カテゴリの履歴トリガー
-- ============================================================
create or replace function public.log_category_history()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.category_histories
    (category_id, name, description, changed_by, action)
  values (
    new.id,
    new.name,
    new.description,
    coalesce(auth.uid(), new.updated_by),
    case
      when tg_op = 'INSERT'                     then 'created'
      when new.is_deleted and not old.is_deleted then 'deleted'
      else                                           'updated'
    end
  );
  return new;
end;
$$;

drop trigger if exists trg_category_history on public.categories;
create trigger trg_category_history
  after insert or update on public.categories
  for each row execute function public.log_category_history();

-- ============================================================
-- 3. 偽造防止: histories への直接 INSERT を剥奪
--    履歴を書けるのはトリガー（SECURITY DEFINER）だけになる。
--    SELECT（閲覧は全員）は触らない。
-- ============================================================
revoke insert on public.procedure_histories from authenticated, anon;
revoke insert on public.category_histories  from authenticated, anon;

drop policy if exists "proc_hist_insert" on public.procedure_histories;
drop policy if exists "cat_hist_insert"  on public.category_histories;

-- 0005 · Fige le search_path des quatre fonctions de trigger.
--
-- POURQUOI : une fonction sans `search_path` explicite résout ses noms de
-- tables selon le search_path du rôle appelant. Un rôle qui pose un schéma
-- homonyme devant `public` détournerait alors ce que la fonction lit et écrit.
-- Les quatre fonctions ci-dessous touchent `pages` : elles doivent la désigner
-- sans ambiguïté. Défaut relevé par les advisors Supabase après la première
-- application réelle (lint 0011_function_search_path_mutable).
--
-- `est_membre_console()` et `choix_sont_booleens()` portaient déjà la clause.
--
-- NOTE sur l'avertissement 0029 (SECURITY DEFINER appelable par un connecté) :
-- `est_membre_console()` DOIT rester exécutable par `authenticated`, les
-- policies de la console l'appellent dans le contexte de l'appelant. Elle ne
-- révèle que l'appartenance de son propre appelant, jamais celle d'un autre
-- compte : l'avertissement est accepté en connaissance de cause.

alter function touch_updated_at() set search_path = public;
alter function calcule_path_page() set search_path = public;
alter function propage_path_descendants() set search_path = public;
alter function verifie_niveau() set search_path = public;

--
-- PostgreSQL database dump
--

\restrict otPNOny0ca5AdfkckhNeDNObVdnK7ySvAGxe192ERevWIBXpfL397vxpL4i69KF

-- Dumped from database version 16.11 (Debian 16.11-1.pgdg13+1)
-- Dumped by pg_dump version 16.11 (Debian 16.11-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: Bill; Type: TABLE DATA; Schema: public; Owner: appuser
--

SET SESSION AUTHORIZATION DEFAULT;

ALTER TABLE public."Bill" DISABLE TRIGGER ALL;

INSERT INTO public."Bill" (id, "tableNumber", "createdAt", "closedAt", status, "waiterName", "baseOrderIds", "extraOrderIds", "subtotalBase", "subtotalExtras", "discountType", "discountValue", "grandTotal") VALUES ('cmlwv1vwt000054d6ovcjdzwe', '3', '2026-02-21 21:58:32.909', NULL, 'open', 'Σερβιτόρος', '{cmlwh2opb000054au52tadlu2}', '{}', 67, 0, NULL, NULL, 67);
INSERT INTO public."Bill" (id, "tableNumber", "createdAt", "closedAt", status, "waiterName", "baseOrderIds", "extraOrderIds", "subtotalBase", "subtotalExtras", "discountType", "discountValue", "grandTotal") VALUES ('cmlwv1z1n000b54d61ft6ckqk', '3', '2026-02-21 21:58:36.971', NULL, 'open', 'Σερβιτόρος', '{cmlwh2opb000054au52tadlu2}', '{}', 67, 0, NULL, NULL, 67);
INSERT INTO public."Bill" (id, "tableNumber", "createdAt", "closedAt", status, "waiterName", "baseOrderIds", "extraOrderIds", "subtotalBase", "subtotalExtras", "discountType", "discountValue", "grandTotal") VALUES ('cmlwv27zz000m54d6rz8p8uj3', '3', '2026-02-21 21:58:48.575', NULL, 'open', 'Σερβιτόρος', '{cmlwh2opb000054au52tadlu2}', '{}', 67, 0, NULL, NULL, 67);
INSERT INTO public."Bill" (id, "tableNumber", "createdAt", "closedAt", status, "waiterName", "baseOrderIds", "extraOrderIds", "subtotalBase", "subtotalExtras", "discountType", "discountValue", "grandTotal") VALUES ('cmlwy17bi0000546ji49m6tnu', '5', '2026-02-21 23:21:59.886', NULL, 'open', 'Σερβιτόρος', '{cmlvgezs7000o54p8ow7jjja2}', '{cmlvgfh2w001h54p8f39wz9sf,cmlwgtskj000054ug3v06dktz}', 105, 55, 'amount', 0, 160);
INSERT INTO public."Bill" (id, "tableNumber", "createdAt", "closedAt", status, "waiterName", "baseOrderIds", "extraOrderIds", "subtotalBase", "subtotalExtras", "discountType", "discountValue", "grandTotal") VALUES ('cmlwyef88000054o18qs79aw5', '1', '2026-02-21 23:32:16.664', NULL, 'open', 'Σερβιτόρος', '{cmlveipu3000g54p82sb99gu9}', '{}', 32, 0, NULL, NULL, 32);
INSERT INTO public."Bill" (id, "tableNumber", "createdAt", "closedAt", status, "waiterName", "baseOrderIds", "extraOrderIds", "subtotalBase", "subtotalExtras", "discountType", "discountValue", "grandTotal") VALUES ('cmlx06mwl000m54i514i5h788', '4', '2026-02-22 00:22:12.598', NULL, 'open', 'Σερβιτόρος', '{cmlx05gpi000054i5t7m5fztm}', '{}', 69, 0, 'amount', 0, 69);


ALTER TABLE public."Bill" ENABLE TRIGGER ALL;

--
-- Data for Name: BillItem; Type: TABLE DATA; Schema: public; Owner: appuser
--

ALTER TABLE public."BillItem" DISABLE TRIGGER ALL;

INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwv1vwt000154d6wmx57ll3', 'cmlwv1vwt000054d6ovcjdzwe', 'cmlp1ro9k000l544gahe7oqpn', 'Νερό', 'Ποτά', 1, 2, 2, 'cmlwh2opb000054au52tadlu2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwv1vwt000254d6e2p0fcfj', 'cmlwv1vwt000054d6ovcjdzwe', '6', 'Ζεστή Σαλάτα με Κοτόπουλο', 'Ζεστές', 1, 5, 5, 'cmlwh2opb000054au52tadlu2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwv1vwt000354d66qcpir7k', 'cmlwv1vwt000054d6ovcjdzwe', '7', 'Σαλάτα με Γαρίδες', 'Ζεστές', 1, 5, 5, 'cmlwh2opb000054au52tadlu2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwv1vwt000454d61pzbfglp', 'cmlwv1vwt000054d6ovcjdzwe', 'cmlp1ro9c0007544gavbsc6um', 'Μπριζόλα Χοιρινή', 'Ψησταριά', 1, 11, 11, 'cmlwh2opb000054au52tadlu2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwv1vwt000554d6z7x1ewu5', 'cmlwv1vwt000054d6ovcjdzwe', 'cmlp1ro9e000a544ga7kmf7kj', 'Μπιφτέκι', 'Ψησταριά', 1, 12, 12, 'cmlwh2opb000054au52tadlu2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwv1vwt000654d6k0w0xmcx', 'cmlwv1vwt000054d6ovcjdzwe', 'cmlp1ro9c0007544gavbsc6um', 'Μπριζόλα Χοιρινή', 'Ψησταριά', 1, 11, 11, 'cmlwh2opb000054au52tadlu2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwv1vwt000754d6kyisjaka', 'cmlwv1vwt000054d6ovcjdzwe', '4', 'Καίσαρ', 'Κρύα', 1, 11, 11, 'cmlwh2opb000054au52tadlu2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwv1vwt000854d6v25ffcjc', 'cmlwv1vwt000054d6ovcjdzwe', 'cmlp1ro980001544god2irck8', 'Πράσινη Σαλάτα', 'Κρύα', 1, 4, 4, 'cmlwh2opb000054au52tadlu2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwv1vwt000954d6130oq5wi', 'cmlwv1vwt000054d6ovcjdzwe', '5', 'Ντοματοσαλάτα', 'Κρύα', 1, 4, 4, 'cmlwh2opb000054au52tadlu2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwv1vwt000a54d6o88z9zpg', 'cmlwv1vwt000054d6ovcjdzwe', 'cmlp1ro9j000j544gajf5as9i', 'Σπράιτ', 'Ποτά', 1, 2, 2, 'cmlwh2opb000054au52tadlu2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwv1z1n000c54d6c701l67j', 'cmlwv1z1n000b54d61ft6ckqk', 'cmlp1ro9k000l544gahe7oqpn', 'Νερό', 'Ποτά', 1, 2, 2, 'cmlwh2opb000054au52tadlu2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwv1z1n000d54d6yix8euso', 'cmlwv1z1n000b54d61ft6ckqk', '6', 'Ζεστή Σαλάτα με Κοτόπουλο', 'Ζεστές', 1, 5, 5, 'cmlwh2opb000054au52tadlu2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwv1z1n000e54d65kme1u7l', 'cmlwv1z1n000b54d61ft6ckqk', '7', 'Σαλάτα με Γαρίδες', 'Ζεστές', 1, 5, 5, 'cmlwh2opb000054au52tadlu2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwv1z1n000f54d6fyprkdyv', 'cmlwv1z1n000b54d61ft6ckqk', 'cmlp1ro9c0007544gavbsc6um', 'Μπριζόλα Χοιρινή', 'Ψησταριά', 1, 11, 11, 'cmlwh2opb000054au52tadlu2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwv1z1n000g54d62mzylw2u', 'cmlwv1z1n000b54d61ft6ckqk', 'cmlp1ro9e000a544ga7kmf7kj', 'Μπιφτέκι', 'Ψησταριά', 1, 12, 12, 'cmlwh2opb000054au52tadlu2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwv1z1n000h54d6q111yrap', 'cmlwv1z1n000b54d61ft6ckqk', 'cmlp1ro9c0007544gavbsc6um', 'Μπριζόλα Χοιρινή', 'Ψησταριά', 1, 11, 11, 'cmlwh2opb000054au52tadlu2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwv1z1n000i54d6izbujfbr', 'cmlwv1z1n000b54d61ft6ckqk', '4', 'Καίσαρ', 'Κρύα', 1, 11, 11, 'cmlwh2opb000054au52tadlu2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwv1z1n000j54d64evhot0u', 'cmlwv1z1n000b54d61ft6ckqk', 'cmlp1ro980001544god2irck8', 'Πράσινη Σαλάτα', 'Κρύα', 1, 4, 4, 'cmlwh2opb000054au52tadlu2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwv1z1n000k54d6zzfun08p', 'cmlwv1z1n000b54d61ft6ckqk', '5', 'Ντοματοσαλάτα', 'Κρύα', 1, 4, 4, 'cmlwh2opb000054au52tadlu2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwv1z1n000l54d6bv1t9hqx', 'cmlwv1z1n000b54d61ft6ckqk', 'cmlp1ro9j000j544gajf5as9i', 'Σπράιτ', 'Ποτά', 1, 2, 2, 'cmlwh2opb000054au52tadlu2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwv27zz000n54d6x4wfoes5', 'cmlwv27zz000m54d6rz8p8uj3', 'cmlp1ro9k000l544gahe7oqpn', 'Νερό', 'Ποτά', 1, 2, 2, 'cmlwh2opb000054au52tadlu2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwv27zz000o54d6lme1hhw3', 'cmlwv27zz000m54d6rz8p8uj3', '6', 'Ζεστή Σαλάτα με Κοτόπουλο', 'Ζεστές', 1, 5, 5, 'cmlwh2opb000054au52tadlu2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwv27zz000p54d6to5k1xtd', 'cmlwv27zz000m54d6rz8p8uj3', '7', 'Σαλάτα με Γαρίδες', 'Ζεστές', 1, 5, 5, 'cmlwh2opb000054au52tadlu2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwv27zz000q54d6gsd3jye0', 'cmlwv27zz000m54d6rz8p8uj3', 'cmlp1ro9c0007544gavbsc6um', 'Μπριζόλα Χοιρινή', 'Ψησταριά', 1, 11, 11, 'cmlwh2opb000054au52tadlu2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwv27zz000r54d69fg2yezr', 'cmlwv27zz000m54d6rz8p8uj3', 'cmlp1ro9e000a544ga7kmf7kj', 'Μπιφτέκι', 'Ψησταριά', 1, 12, 12, 'cmlwh2opb000054au52tadlu2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwv27zz000s54d6bi0mx5kg', 'cmlwv27zz000m54d6rz8p8uj3', 'cmlp1ro9c0007544gavbsc6um', 'Μπριζόλα Χοιρινή', 'Ψησταριά', 1, 11, 11, 'cmlwh2opb000054au52tadlu2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwv27zz000t54d6he7jsolx', 'cmlwv27zz000m54d6rz8p8uj3', '4', 'Καίσαρ', 'Κρύα', 1, 11, 11, 'cmlwh2opb000054au52tadlu2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwv27zz000u54d67pzgnbao', 'cmlwv27zz000m54d6rz8p8uj3', 'cmlp1ro980001544god2irck8', 'Πράσινη Σαλάτα', 'Κρύα', 1, 4, 4, 'cmlwh2opb000054au52tadlu2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwv27zz000v54d612265hey', 'cmlwv27zz000m54d6rz8p8uj3', '5', 'Ντοματοσαλάτα', 'Κρύα', 1, 4, 4, 'cmlwh2opb000054au52tadlu2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwv27zz000w54d6r8cykr8q', 'cmlwv27zz000m54d6rz8p8uj3', 'cmlp1ro9j000j544gajf5as9i', 'Σπράιτ', 'Ποτά', 1, 2, 2, 'cmlwh2opb000054au52tadlu2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwy17bj0001546js5fv3bzr', 'cmlwy17bi0000546ji49m6tnu', '4', 'Καίσαρ', 'Κρύα', 1, 11, 11, 'cmlvgfh2w001h54p8f39wz9sf', true);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwy17bj0002546j6pvnwdet', 'cmlwy17bi0000546ji49m6tnu', '1', 'Χωριάτικη Σαλάτα', 'Κρύα', 1, 6, 6, 'cmlvgfh2w001h54p8f39wz9sf', true);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwy17bj0003546jak556zvw', 'cmlwy17bi0000546ji49m6tnu', 'cmlp1ro980001544god2irck8', 'Πράσινη Σαλάτα', 'Κρύα', 1, 4, 4, 'cmlwgtskj000054ug3v06dktz', true);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwy17bj0004546j41ais12f', 'cmlwy17bi0000546ji49m6tnu', '3', 'Ρόκα με Παρμεζάνα', 'Κρύα', 1, 5, 5, 'cmlwgtskj000054ug3v06dktz', true);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwy17bj0005546ju7bykcml', 'cmlwy17bi0000546ji49m6tnu', '5', 'Ντοματοσαλάτα', 'Κρύα', 1, 4, 4, 'cmlwgtskj000054ug3v06dktz', true);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwy17bj0006546jdc2wqpfk', 'cmlwy17bi0000546ji49m6tnu', '6', 'Ζεστή Σαλάτα με Κοτόπουλο', 'Ζεστές', 1, 5, 5, 'cmlwgtskj000054ug3v06dktz', true);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwy17bj0007546j04ythj1k', 'cmlwy17bi0000546ji49m6tnu', 'cmlp1ro9h000g544g5amanu5e', 'Γιουβέτσι', 'Μαγειρευτό', 1, 15, 15, 'cmlwgtskj000054ug3v06dktz', true);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwy17bj0008546j1q03h1gx', 'cmlwy17bi0000546ji49m6tnu', '15', 'Παστίτσιο', 'Μαγειρευτό', 1, 5, 5, 'cmlwgtskj000054ug3v06dktz', true);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwy17bj0009546jj6fzi7ls', 'cmlwy17bi0000546ji49m6tnu', 'cmlp1ro980001544god2irck8', 'Πράσινη Σαλάτα', 'Κρύα', 1, 4, 4, 'cmlvgezs7000o54p8ow7jjja2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwy17bj000a546j81hqguuu', 'cmlwy17bi0000546ji49m6tnu', '5', 'Ντοματοσαλάτα', 'Κρύα', 1, 4, 4, 'cmlvgezs7000o54p8ow7jjja2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwy17bj000b546jch07e5gy', 'cmlwy17bi0000546ji49m6tnu', '6', 'Ζεστή Σαλάτα με Κοτόπουλο', 'Ζεστές', 1, 5, 5, 'cmlvgezs7000o54p8ow7jjja2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwy17bj000c546jva8j98r3', 'cmlwy17bi0000546ji49m6tnu', 'cmlp1ro9e000a544ga7kmf7kj', 'Μπιφτέκι', 'Ψησταριά', 1, 12, 12, 'cmlvgezs7000o54p8ow7jjja2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwy17bj000d546jxyz7gyxc', 'cmlwy17bi0000546ji49m6tnu', '16', 'Παπουτσάκια', 'Μαγειρευτό', 1, 5, 5, 'cmlvgezs7000o54p8ow7jjja2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwy17bj000e546j1wuzuuhu', 'cmlwy17bi0000546ji49m6tnu', 'cmlp1ro9h000g544g5amanu5e', 'Γιουβέτσι', 'Μαγειρευτό', 1, 15, 15, 'cmlvgezs7000o54p8ow7jjja2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwy17bj000f546jcqmx9wk4', 'cmlwy17bi0000546ji49m6tnu', '14', 'Μουσακάς', 'Μαγειρευτό', 1, 5, 5, 'cmlvgezs7000o54p8ow7jjja2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwy17bj000g546jjdzi1uhd', 'cmlwy17bi0000546ji49m6tnu', 'cmlp1ro9j000j544gajf5as9i', 'Σπράιτ', 'Ποτά', 3, 2, 6, 'cmlvgezs7000o54p8ow7jjja2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwy17bj000h546j3xroiviz', 'cmlwy17bi0000546ji49m6tnu', 'cmlp1ro9d0008544gc4sq0sfy', 'Μπριζόλα Μοσχαρίσια', 'Ψησταριά', 1, 22, 22, 'cmlvgezs7000o54p8ow7jjja2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwy17bj000i546juvanwrkc', 'cmlwy17bi0000546ji49m6tnu', '15', 'Παστίτσιο', 'Μαγειρευτό', 1, 5, 5, 'cmlvgezs7000o54p8ow7jjja2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwy17bj000j546jo38qzy5m', 'cmlwy17bi0000546ji49m6tnu', '3', 'Ρόκα με Παρμεζάνα', 'Κρύα', 1, 5, 5, 'cmlvgezs7000o54p8ow7jjja2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwy17bj000k546j93zat4e6', 'cmlwy17bi0000546ji49m6tnu', '4', 'Καίσαρ', 'Κρύα', 1, 11, 11, 'cmlvgezs7000o54p8ow7jjja2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwy17bj000l546j8q62k5a0', 'cmlwy17bi0000546ji49m6tnu', '1', 'Χωριάτικη Σαλάτα', 'Κρύα', 1, 6, 6, 'cmlvgezs7000o54p8ow7jjja2', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwyef88000154o19109eqc0', 'cmlwyef88000054o18qs79aw5', '4', 'Καίσαρ', 'Κρύα', 2, 11, 22, 'cmlveipu3000g54p82sb99gu9', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwyef88000254o1kdtctyzk', 'cmlwyef88000054o18qs79aw5', '1', 'Χωριάτικη Σαλάτα', 'Κρύα', 1, 6, 6, 'cmlveipu3000g54p82sb99gu9', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlwyef88000354o1hrv1x2ka', 'cmlwyef88000054o18qs79aw5', 'cmlp1ro980001544god2irck8', 'Πράσινη Σαλάτα', 'Κρύα', 1, 4, 4, 'cmlveipu3000g54p82sb99gu9', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlx06mwm000n54i5tmpqxomm', 'cmlx06mwl000m54i514i5h788', 'd9f16dcd-40e0-40cf-accf-95c2905e7faa', 'Μαλαματίνα 500ml', 'Ποτά/Αναψυκτικά', 2, 4, 8, 'cmlx05gpi000054i5t7m5fztm', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlx06mwm000o54i5pcwjsm2d', 'cmlx06mwl000m54i514i5h788', '74d6ab05-1edd-460a-83c1-412251cd1203', 'Κρασί Κόκκινο 500ml', 'Ποτά/Αναψυκτικά', 1, 4, 4, 'cmlx05gpi000054i5t7m5fztm', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlx06mwm000p54i5e3hqduns', 'cmlx06mwl000m54i514i5h788', '14c77dd5-203b-417e-b352-2c01e9d9882f', 'Λουκάνικο Χωριάτικο', 'Ψητά/Της ώρας', 1, 9, 9, 'cmlx05gpi000054i5t7m5fztm', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlx06mwm000q54i5u4ugor34', 'cmlx06mwl000m54i514i5h788', 'ecd9b917-2a97-4a47-9134-ee9e56d9cf8c', 'Αντζούγιες', 'Νηστίσιμα', 1, 5, 5, 'cmlx05gpi000054i5t7m5fztm', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlx06mwm000r54i5n92a3i3p', 'cmlx06mwl000m54i514i5h788', 'e48be9c8-4ebb-4563-80a9-6e53671fd588', 'Μυδοπίλαφο', 'Νηστίσιμα', 1, 9, 9, 'cmlx05gpi000054i5t7m5fztm', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlx06mwm000s54i5ei9gc6df', 'cmlx06mwl000m54i514i5h788', 'f6cb1a78-c1aa-46f2-abb6-5072e0b4522a', 'Κότσι', 'Μερίδες', 1, 12, 12, 'cmlx05gpi000054i5t7m5fztm', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlx06mwm000t54i5um0a3r7w', 'cmlx06mwl000m54i514i5h788', '77b0e1ac-0da6-4da8-a365-9d1105450a50', 'Κοκκινιστό Μοσχαράκι', 'Μαγειρευτά', 1, 9, 9, 'cmlx05gpi000054i5t7m5fztm', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlx06mwm000u54i5vgtx7524', 'cmlx06mwl000m54i514i5h788', 'f681d22c-4131-4094-87a7-e4defefe1fe1', 'Φέτα', 'Τυριά', 1, 4, 4, 'cmlx05gpi000054i5t7m5fztm', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlx06mwm000v54i5mirq6kgb', 'cmlx06mwl000m54i514i5h788', 'fdf59e73-f023-4e38-ac23-cab9fd87171a', 'Πατάτες τηγανητές', 'Ορεκτικά', 1, 4, 4, 'cmlx05gpi000054i5t7m5fztm', false);
INSERT INTO public."BillItem" (id, "billId", "menuItemId", name, category, quantity, "unitPrice", "lineTotal", "orderId", "isExtra") VALUES ('cmlx06mwm000w54i549zrooh8', 'cmlx06mwl000m54i514i5h788', '26c73168-43bb-4417-89d8-38e60edd32f9', 'Ντολμαδάκια', 'Ορεκτικά', 1, 5, 5, 'cmlx05gpi000054i5t7m5fztm', false);


ALTER TABLE public."BillItem" ENABLE TRIGGER ALL;

--
-- Data for Name: MenuItem; Type: TABLE DATA; Schema: public; Owner: appuser
--

ALTER TABLE public."MenuItem" DISABLE TRIGGER ALL;

INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('f681d22c-4131-4094-87a7-e4defefe1fe1', 'Φέτα', 'Τυριά', NULL, 4, false);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('cf819158-8ed5-42ba-a80b-a9dbd4edc286', 'Καυτερή Πιπεριά', 'Ορεκτικά', NULL, 2, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('26c73168-43bb-4417-89d8-38e60edd32f9', 'Ντολμαδάκια', 'Ορεκτικά', NULL, 5, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('fdf59e73-f023-4e38-ac23-cab9fd87171a', 'Πατάτες τηγανητές', 'Ορεκτικά', NULL, 4, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('ecd1dd62-64b4-4a4f-a71e-5e1e7b5f5092', 'Σκουμπρί Καπνιστό', 'Ορεκτικά', NULL, 6, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('5365571d-46f3-4f7b-97ae-f2072c7f33af', 'Ταραμάς', 'Αλοιφές', NULL, 4, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('76cf6383-071d-46f1-962b-90cf46d17c7b', 'Τζατζίκι', 'Αλοιφές', NULL, 4, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('4b8f8e73-b148-4103-96da-40e2f9ec3209', 'Μαρούλι & Ρόκα', 'Σαλάτες', NULL, 4, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('5a40e15d-aa17-4196-a4e4-eca2b54f9777', 'Πατατοσαλάτα', 'Σαλάτες', NULL, 4, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('79a0fd2f-11c6-4f37-b1c2-c346fe36a5f5', 'Πικάντικη', 'Σαλάτες', NULL, 4, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('cc941100-4bd6-4304-adcc-c7138ee544ee', 'Ζυγούρι στη γάστρα', 'Μαγειρευτά', NULL, 10, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('77b0e1ac-0da6-4da8-a365-9d1105450a50', 'Κοκκινιστό Μοσχαράκι', 'Μαγειρευτά', NULL, 9, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('f6cb1a78-c1aa-46f2-abb6-5072e0b4522a', 'Κότσι', 'Μερίδες', 'Χοιρινό', 12, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('ecd9b917-2a97-4a47-9134-ee9e56d9cf8c', 'Αντζούγιες', 'Νηστίσιμα', NULL, 5, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('e7305ff7-960a-41df-91f4-7ee44a5e2543', 'Καλαμαράκια Τηγανητά', 'Νηστίσιμα', NULL, 9, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('e48be9c8-4ebb-4563-80a9-6e53671fd588', 'Μυδοπίλαφο', 'Νηστίσιμα', NULL, 9, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('120fe012-c180-440b-a6c6-1e28678fb936', 'Σουπιές κρασάτες', 'Νηστίσιμα', NULL, 11, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('2f3c02d6-cd32-485f-8ffb-4be299ea08df', 'Φασουλονταβάς', 'Νηστίσιμα', NULL, 6, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('68045ddc-5215-4772-82c7-2b22eb7c8527', 'Χταπόδι Ξυδάτο', 'Νηστίσιμα', NULL, 9, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('14c77dd5-203b-417e-b352-2c01e9d9882f', 'Λουκάνικο Χωριάτικο', 'Ψητά/Της ώρας', 'Μερίδες', 9, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('7ae914af-68f9-4aec-a2fe-c67c1e6969e8', 'Κοντοσούβλι', 'Σούβλες', 'Κοτόπουλο', 11, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('4cf481fe-228a-4cb1-ab44-02bb64511de1', 'Κοντοσούβλι', 'Σούβλες', 'Χοιρινό', 11, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('24b12e85-e222-4eb3-8ec8-8f4223b37460', 'Ελασσονίτικο', 'Σούβλες', 'Μερίδες', 11, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('9f674a7b-597f-40a2-b55a-3da7a3cb0247', 'Βίκος Γκαζόζα 250ml', 'Ποτά/Αναψυκτικά', 'Αναψυκτικά', 2.5, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('f71a60da-7dc1-431f-9582-63897b4a370d', 'Βίκος Κόλα 250ml', 'Ποτά/Αναψυκτικά', 'Αναψυκτικά', 2.5, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('596a7199-03b5-4438-8a45-48f034c2b02d', 'Βίκος Λεμονάδα 250ml', 'Ποτά/Αναψυκτικά', 'Αναψυκτικά', 2.5, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('33aeeb3e-43ee-4d9d-8b8f-ba520713d21a', 'Βίκος Πορτοκαλάδα 250ml', 'Ποτά/Αναψυκτικά', 'Αναψυκτικά', 2.5, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('4521ca46-6de9-4165-b262-4ed7d2b95332', 'Βίκος Σόδα 250ml', 'Ποτά/Αναψυκτικά', 'Αναψυκτικά', 2.5, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('216eb577-52a5-4865-9475-25f4d0d3cefb', 'Νερό - μικρό 500ml Εμφιαλωμένο', 'Ποτά/Αναψυκτικά', 'Νερό', 0.5, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('1e925b44-4811-4ebf-8c17-005dcbdca494', 'Νερό - μεγάλο 1.5lt Εμφιαλωμένο', 'Ποτά/Αναψυκτικά', 'Νερό', 1.5, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('9c130ce8-0b51-4ac8-97e5-be6c0c734873', 'Βασιλική 500ml', 'Ποτά/Αναψυκτικά', 'Ρετσίνα', 5.5, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('d9f16dcd-40e0-40cf-accf-95c2905e7faa', 'Μαλαματίνα 500ml', 'Ποτά/Αναψυκτικά', 'Ρετσίνα', 4, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('ad9db1ed-6f4d-4c95-a536-de38aa7093dc', 'Κρασί Λευκό 500ml', 'Ποτά/Αναψυκτικά', 'Κρασί', 4, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('74d6ab05-1edd-460a-83c1-412251cd1203', 'Κρασί Κόκκινο 500ml', 'Ποτά/Αναψυκτικά', 'Κρασί', 4, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('fbb2444f-4173-48f3-9318-0c19f9209a37', 'Κρασί λευκό 1lt', 'Ποτά/Αναψυκτικά', 'Κρασί', 7, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('00d8d2c1-0ae7-4d22-a9ff-9777e337249b', 'Κρασί κοκκινο 1lt', 'Ποτά/Αναψυκτικά', 'Κρασί', 7, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('5a147615-af6e-4387-a919-ffdcf210ae08', 'Αποστολάκη - Εμφιαλωμένο 200ml', 'Ποτά/Αναψυκτικά', 'Τσίπουρο', 8, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('caf58116-7f8a-4180-b617-f6cdda1cd355', 'Ηδωνικό - Εμφιαλωμένο 200ml - Χωρίς Γλυκάνισο', 'Ποτά/Αναψυκτικά', 'Τσίπουρο', 10, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('876bf2fd-076d-4f5d-9515-24fc7bfa44e1', 'Χύμα 100ml - Χωρίς Γλυκάνισο', 'Ποτά/Αναψυκτικά', 'Τσίπουρο', 3.5, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('2a1ad52f-e12a-4246-8253-a59777ca2ec1', 'Χύμα 200ml - Χωρίς Γλυκάνισο', 'Ποτά/Αναψυκτικά', 'Τσίπουρο', 7, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('7e5cf80c-6c91-41da-9d9a-441f566e9ffe', 'Χύμα 100ml - Με Γλυκάνισο', 'Ποτά/Αναψυκτικά', 'Τσίπουρο', 3.5, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('534856a6-3339-45c2-8021-4548126b9e93', 'Χύμα 200ml - Με Γλυκάνισο', 'Ποτά/Αναψυκτικά', 'Τσίπουρο', 7, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('560d4a93-ac2a-409f-892f-a3e5babaa221', 'Ούζο 12 - Εμφιαλωμένο 200ml', 'Ποτά/Αναψυκτικά', 'Ούζο', 8, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('337934de-fc2f-44c0-a432-269faafba33a', 'Πλωμάρι - Εμφιαλωμένο 200ml', 'Ποτά/Αναψυκτικά', 'Ούζο', 8, true);
INSERT INTO public."MenuItem" (id, name, category, "extraNotes", price, active) VALUES ('6b66e13c-2dee-4fd4-964e-f3d9891db81d', 'ΑΛΦΑ 500ml', 'Ποτά/Αναψυκτικά', 'Μπύρες', NULL, true);


ALTER TABLE public."MenuItem" ENABLE TRIGGER ALL;

--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: appuser
--

ALTER TABLE public."Order" DISABLE TRIGGER ALL;

INSERT INTO public."Order" (id, "tableNumber", "waiterName", "timestamp", status, "extraNotes", "isExtra", "parentId") VALUES ('cmlx0990s000x54i543gi0zbz', '4', 'Σερβιτόρος', '2026-02-22 00:24:14.572', 'pending', NULL, true, 'cmlx05gpi000054i5t7m5fztm');
INSERT INTO public."Order" (id, "tableNumber", "waiterName", "timestamp", status, "extraNotes", "isExtra", "parentId") VALUES ('cmlx05gpi000054i5t7m5fztm', '4', 'Σερβιτόρος', '2026-02-22 00:21:17.902', 'pending', NULL, false, NULL);


ALTER TABLE public."Order" ENABLE TRIGGER ALL;

--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: appuser
--

ALTER TABLE public."OrderItem" DISABLE TRIGGER ALL;

INSERT INTO public."OrderItem" (id, name, quantity, category, "itemStatus", "orderId", "extraNotes") VALUES ('cmlx05gpj000154i5da080j0h', 'Μαλαματίνα 500ml', 2, 'Ποτά/Αναψυκτικά', 'pending', 'cmlx05gpi000054i5t7m5fztm', NULL);
INSERT INTO public."OrderItem" (id, name, quantity, category, "itemStatus", "orderId", "extraNotes") VALUES ('cmlx05gpj000454i5pnt7ffxw', 'Κρασί Κόκκινο 500ml', 1, 'Ποτά/Αναψυκτικά', 'pending', 'cmlx05gpi000054i5t7m5fztm', NULL);
INSERT INTO public."OrderItem" (id, name, quantity, category, "itemStatus", "orderId", "extraNotes") VALUES ('cmlx05gpj000654i53wtrx3k2', 'Λουκάνικο Χωριάτικο', 1, 'Ψητά/Της ώρας', 'pending', 'cmlx05gpi000054i5t7m5fztm', NULL);
INSERT INTO public."OrderItem" (id, name, quantity, category, "itemStatus", "orderId", "extraNotes") VALUES ('cmlx05gpj000854i5in22u7cb', 'Αντζούγιες', 1, 'Νηστίσιμα', 'pending', 'cmlx05gpi000054i5t7m5fztm', NULL);
INSERT INTO public."OrderItem" (id, name, quantity, category, "itemStatus", "orderId", "extraNotes") VALUES ('cmlx05gpj000a54i5hbmb7w7j', 'Μυδοπίλαφο', 1, 'Νηστίσιμα', 'pending', 'cmlx05gpi000054i5t7m5fztm', NULL);
INSERT INTO public."OrderItem" (id, name, quantity, category, "itemStatus", "orderId", "extraNotes") VALUES ('cmlx05gpj000c54i53naqtqmd', 'Κότσι', 1, 'Μερίδες', 'pending', 'cmlx05gpi000054i5t7m5fztm', NULL);
INSERT INTO public."OrderItem" (id, name, quantity, category, "itemStatus", "orderId", "extraNotes") VALUES ('cmlx05gpj000e54i5r1anor9w', 'Κοκκινιστό Μοσχαράκι', 1, 'Μαγειρευτά', 'pending', 'cmlx05gpi000054i5t7m5fztm', NULL);
INSERT INTO public."OrderItem" (id, name, quantity, category, "itemStatus", "orderId", "extraNotes") VALUES ('cmlx05gpj000g54i54id5rspb', 'Φέτα', 1, 'Τυριά', 'pending', 'cmlx05gpi000054i5t7m5fztm', NULL);
INSERT INTO public."OrderItem" (id, name, quantity, category, "itemStatus", "orderId", "extraNotes") VALUES ('cmlx05gpj000i54i5h66t89lh', 'Πατάτες τηγανητές', 1, 'Ορεκτικά', 'pending', 'cmlx05gpi000054i5t7m5fztm', NULL);
INSERT INTO public."OrderItem" (id, name, quantity, category, "itemStatus", "orderId", "extraNotes") VALUES ('cmlx05gpj000k54i5mh2wue3c', 'Ντολμαδάκια', 1, 'Ορεκτικά', 'pending', 'cmlx05gpi000054i5t7m5fztm', NULL);
INSERT INTO public."OrderItem" (id, name, quantity, category, "itemStatus", "orderId", "extraNotes") VALUES ('cmlx0990s000y54i5vq0ga8jo', 'Ντολμαδάκια', 1, 'Ορεκτικά', 'pending', 'cmlx0990s000x54i543gi0zbz', NULL);
INSERT INTO public."OrderItem" (id, name, quantity, category, "itemStatus", "orderId", "extraNotes") VALUES ('cmlx0990s001054i5qmvfnti0', 'Πατάτες τηγανητές', 1, 'Ορεκτικά', 'pending', 'cmlx0990s000x54i543gi0zbz', NULL);
INSERT INTO public."OrderItem" (id, name, quantity, category, "itemStatus", "orderId", "extraNotes") VALUES ('cmlx0990s001254i5cttm09ie', 'Φέτα', 1, 'Τυριά', 'pending', 'cmlx0990s000x54i543gi0zbz', NULL);
INSERT INTO public."OrderItem" (id, name, quantity, category, "itemStatus", "orderId", "extraNotes") VALUES ('cmlx0990s001454i5o54krlou', 'Μαρούλι & Ρόκα', 1, 'Σαλάτες', 'pending', 'cmlx0990s000x54i543gi0zbz', NULL);
INSERT INTO public."OrderItem" (id, name, quantity, category, "itemStatus", "orderId", "extraNotes") VALUES ('cmlx0990s001654i5ixnstgun', 'Κοκκινιστό Μοσχαράκι', 1, 'Μαγειρευτά', 'pending', 'cmlx0990s000x54i543gi0zbz', NULL);


ALTER TABLE public."OrderItem" ENABLE TRIGGER ALL;

--
-- Data for Name: OrderItemUnit; Type: TABLE DATA; Schema: public; Owner: appuser
--

ALTER TABLE public."OrderItemUnit" DISABLE TRIGGER ALL;

INSERT INTO public."OrderItemUnit" (id, "orderItemId", status, "unitIndex") VALUES ('cmlx05gpj000254i5w1kwqoga', 'cmlx05gpj000154i5da080j0h', 'pending', 0);
INSERT INTO public."OrderItemUnit" (id, "orderItemId", status, "unitIndex") VALUES ('cmlx05gpj000354i50ifpyz9s', 'cmlx05gpj000154i5da080j0h', 'pending', 1);
INSERT INTO public."OrderItemUnit" (id, "orderItemId", status, "unitIndex") VALUES ('cmlx05gpj000554i596o33m0i', 'cmlx05gpj000454i5pnt7ffxw', 'pending', 0);
INSERT INTO public."OrderItemUnit" (id, "orderItemId", status, "unitIndex") VALUES ('cmlx05gpj000754i56s02kg4m', 'cmlx05gpj000654i53wtrx3k2', 'pending', 0);
INSERT INTO public."OrderItemUnit" (id, "orderItemId", status, "unitIndex") VALUES ('cmlx05gpj000954i58gp9mgjh', 'cmlx05gpj000854i5in22u7cb', 'pending', 0);
INSERT INTO public."OrderItemUnit" (id, "orderItemId", status, "unitIndex") VALUES ('cmlx05gpj000b54i5ygghdwxe', 'cmlx05gpj000a54i5hbmb7w7j', 'pending', 0);
INSERT INTO public."OrderItemUnit" (id, "orderItemId", status, "unitIndex") VALUES ('cmlx05gpj000d54i59r7mccay', 'cmlx05gpj000c54i53naqtqmd', 'pending', 0);
INSERT INTO public."OrderItemUnit" (id, "orderItemId", status, "unitIndex") VALUES ('cmlx05gpj000f54i5f47zbbom', 'cmlx05gpj000e54i5r1anor9w', 'pending', 0);
INSERT INTO public."OrderItemUnit" (id, "orderItemId", status, "unitIndex") VALUES ('cmlx05gpj000h54i5hn6zebr9', 'cmlx05gpj000g54i54id5rspb', 'pending', 0);
INSERT INTO public."OrderItemUnit" (id, "orderItemId", status, "unitIndex") VALUES ('cmlx05gpj000j54i5ax2m8hxb', 'cmlx05gpj000i54i5h66t89lh', 'pending', 0);
INSERT INTO public."OrderItemUnit" (id, "orderItemId", status, "unitIndex") VALUES ('cmlx05gpj000l54i5swaqvrxo', 'cmlx05gpj000k54i5mh2wue3c', 'pending', 0);
INSERT INTO public."OrderItemUnit" (id, "orderItemId", status, "unitIndex") VALUES ('cmlx0990s000z54i5fbr8mppx', 'cmlx0990s000y54i5vq0ga8jo', 'pending', 0);
INSERT INTO public."OrderItemUnit" (id, "orderItemId", status, "unitIndex") VALUES ('cmlx0990s001154i5zvpdr7vg', 'cmlx0990s001054i5qmvfnti0', 'pending', 0);
INSERT INTO public."OrderItemUnit" (id, "orderItemId", status, "unitIndex") VALUES ('cmlx0990s001354i5i56y0uv7', 'cmlx0990s001254i5cttm09ie', 'pending', 0);
INSERT INTO public."OrderItemUnit" (id, "orderItemId", status, "unitIndex") VALUES ('cmlx0990s001554i5ysnmvvin', 'cmlx0990s001454i5o54krlou', 'pending', 0);
INSERT INTO public."OrderItemUnit" (id, "orderItemId", status, "unitIndex") VALUES ('cmlx0990s001754i5b5qtuycr', 'cmlx0990s001654i5ixnstgun', 'pending', 0);


ALTER TABLE public."OrderItemUnit" ENABLE TRIGGER ALL;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: appuser
--

ALTER TABLE public._prisma_migrations DISABLE TRIGGER ALL;

INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('5660819d-01e7-41be-a7e0-f37d2da4b054', 'b0c5490fd66dac979f5b38d7a3db5640c4d05b7091df3ac03ec2e3ca9666e461', '2026-02-16 10:42:25.30722+00', '20260216104225_init', NULL, NULL, '2026-02-16 10:42:25.298499+00', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('a1ed77b3-a2ef-40bb-918b-14b0507f35cb', 'a033a17b3a3162ca45182631e5175ac19d3ff8d2b2f32a277441cfe968710ac7', '2026-02-16 11:01:19.452075+00', '20260216110119_add_extra_notes', NULL, NULL, '2026-02-16 11:01:19.450051+00', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('bd54cda4-95e7-4adc-a591-61e5ed1a24f7', 'fcf53a557d52aacb8446e39bb8a4a0f28063bbd442911f87356d734b59b34a6b', '2026-02-18 16:40:15.071539+00', '202602181726_add_menu_item_fields', NULL, NULL, '2026-02-18 16:40:15.055492+00', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('759115ce-9efd-48f3-b84c-e94b775d7cf7', 'bbb256b641b322334ce3eadf9d381d8c29814cbec837bdb33c511e2e7444798d', '2026-02-20 12:18:50.188981+00', '202602201415_add_order_extras', NULL, NULL, '2026-02-20 12:18:50.183376+00', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('89d7b758-6216-4502-bfb3-8b5fecdbfef4', 'f0cc1e8e344199d84143e7664621b33fc8e489bf86499cd7b9476c7cbee6bc19', '2026-02-20 14:17:41.53482+00', '202602201553_add_order_item_units', NULL, NULL, '2026-02-20 14:17:41.521181+00', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('0ec98d24-7124-4769-b111-54d75a649b34', '4ab60d9632b133c0caaf43889eb4493e6425cf98aaa7bff0bc2645888f9368e0', '2026-02-21 21:57:43.274746+00', '20260221215730_add_billing_models', NULL, NULL, '2026-02-21 21:57:43.255998+00', 1);


ALTER TABLE public._prisma_migrations ENABLE TRIGGER ALL;

--
-- PostgreSQL database dump complete
--

\unrestrict otPNOny0ca5AdfkckhNeDNObVdnK7ySvAGxe192ERevWIBXpfL397vxpL4i69KF


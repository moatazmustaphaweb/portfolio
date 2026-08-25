-- 0060 — the real pixel dimensions of every media row, read from Cloudinary
--
-- 152 of 161 rows had NULL width and height. Only the covers carried any, and
-- they were set by hand when they were uploaded.
--
-- TWO THINGS WERE BROKEN BY THIS, AND ONLY ONE OF THEM WAS VISIBLE.
--
--   1. `CloudinaryImage` uses width/height to reserve the right box before an
--      image loads (`components/media/CloudinaryImage.tsx`, the `height`
--      calculation). With both NULL it falls back to the preset's own width as
--      the height, so every chapter figure reserved a SQUARE and the page
--      reflowed as each picture arrived.
--
--   2. Nothing could tell a desktop screenshot from a phone one. That is what
--      this backfill was actually run for: the laptop device frame has to go
--      on web screens and must not go on mobile ones, and orientation is the
--      only honest signal for that — a folder name is a filing convention, not
--      a fact about the picture.
--
-- The values are Cloudinary's own, read from the Admin API
-- (`/resources/image/upload?public_ids[]=…`), not measured or inferred.
--
-- ONE ROW IS DELIBERATELY ABSENT: `EIDVSNID_9jby0x9jby0x9jby`, which the Admin
-- API does not return under `image/upload`. It already carries 848x1264 from
-- its own upload, so it needs nothing. A dimension that was not verified is
-- not written here — a wrong number is worse than a NULL, because NULL is
-- visibly missing and a wrong number is not.
--
-- ⚠️ THIS IS A BACKFILL, NOT A FIX. `scripts/sync-notion.ts` still creates
-- media rows without dimensions, so the next `[cld]` tag added in Notion
-- arrives NULL like these did. That is a separate task and it is open.

update media set width = 786, height = 1704 where cloudinary_public_id = '00. UAE NEOBIZ - Mobile - Jul 27/Financial Details - Single/23-sanction-q1-default';
update media set width = 1600, height = 1200 where cloudinary_public_id = '00. UAE NEOBIZ - Mobile - Jul 27/Pre-Submition/38-withdraw-reason-default';
update media set width = 4322, height = 4323 where cloudinary_public_id = '00. UAE NEOBIZ - Mobile - Jul 27/Pre-Submition/44-track-dashboard-application-submitted';
update media set width = 794, height = 1712 where cloudinary_public_id = '00. UAE NEOBIZ - Mobile - Jul 27/Pre-Submition/45-track-dashboard-standard-exceptions-raised';
update media set width = 4320, height = 4320 where cloudinary_public_id = '00. UAE NEOBIZ - Mobile - Jul 27/Pre-Submition/59-exception-detail-moa-upload-empty';
update media set width = 786, height = 1704 where cloudinary_public_id = '00. UAE NEOBIZ - Mobile - Jul 27/Regulatory Declaration - Single/02-application-dashboard-with-header';
update media set width = 786, height = 1704 where cloudinary_public_id = '00. UAE NEOBIZ - Mobile - Jul 27/Regulatory Declaration - Single/23-key-individuals-list-verification-link-sent';
update media set width = 786, height = 1704 where cloudinary_public_id = '00. UAE NEOBIZ - Mobile - Jul 27/Regulatory Declaration - Single/49-facial-recognition-consent';
update media set width = 786, height = 1704 where cloudinary_public_id = '00. UAE NEOBIZ - Mobile - Jul 27/Regulatory Declaration - Single/57-verification-failed-continue-with-docs';
update media set width = 786, height = 1704 where cloudinary_public_id = '00. UAE NEOBIZ - Mobile - Jul 27/Regulatory Declaration - Single/61-efr-verification-link-generated';
update media set width = 2936, height = 1868 where cloudinary_public_id = '00. UAE NEOBIZ - Mobile - Jul 27/Signup and Onboarding/01-welcome';
update media set width = 786, height = 1704 where cloudinary_public_id = '00. UAE NEOBIZ - Mobile - Jul 27/Signup and Onboarding/30-ownership-structure-picker';
update media set width = 2880, height = 2100 where cloudinary_public_id = '2. BB Egypt - Application Workflow - Jul 27/Dashboard/04-application-list-default';
update media set width = 2880, height = 2300 where cloudinary_public_id = '2. BB Egypt - Application Workflow - Jul 27/Dashboard/05-application-list-notification-banner';
update media set width = 2880, height = 2192 where cloudinary_public_id = '2. BB Egypt - Application Workflow - Jul 27/Dashboard/06-application-list-filters-applied';
update media set width = 2880, height = 3852 where cloudinary_public_id = '2. BB Egypt - Application Workflow - Jul 27/Dashboard/17-ename-screening-summary-report';
update media set width = 2880, height = 3852 where cloudinary_public_id = '2. BB Egypt - Application Workflow - Jul 27/Dashboard/18-ename-screening-match-details-expanded';
update media set width = 2909, height = 2268 where cloudinary_public_id = '2. BB Egypt - Application Workflow - Jul 27/Dashboard/24-modal-raise-exception-overlay';
update media set width = 2880, height = 1800 where cloudinary_public_id = '2. BB Egypt - Application Workflow - Jul 27/Dashboard/31-mandates-rules-list';
update media set width = 2880, height = 1904 where cloudinary_public_id = '2. BB Egypt - Application Workflow - Jul 27/Dashboard/34-decision-need-customer-clarification';
update media set width = 2880, height = 2888 where cloudinary_public_id = '2. BB Egypt - Application Workflow - Jul 27/Dashboard/35-decision-exceptions-review';
update media set width = 2880, height = 1936 where cloudinary_public_id = '2. BB Egypt - Application Workflow - Jul 27/Dashboard/36-exception-trail';
update media set width = 2880, height = 1952 where cloudinary_public_id = '2. BB Egypt - Application Workflow - Jul 27/Dashboard/37-audit-log';
update media set width = 2880, height = 2048 where cloudinary_public_id = '3. NEO BIZ Acquisition Customer Portal - Egypt - Jul 27/Arabic/Customer portal/43-app-overview-queries-awaiting-response';
update media set width = 2880, height = 2048 where cloudinary_public_id = '3. NEO BIZ Acquisition Customer Portal - Egypt - Jul 27/Arabic/Customer portal/44-app-overview-submitted-no-queries';
update media set width = 2880, height = 2048 where cloudinary_public_id = '3. NEO BIZ Acquisition Customer Portal - Egypt - Jul 27/Arabic/Customer portal/46-pending-queries-empty-state';
update media set width = 2880, height = 2048 where cloudinary_public_id = '3. NEO BIZ Acquisition Customer Portal - Egypt - Jul 27/Arabic/Customer portal/48-pending-queries-tax-card-submitted';
update media set width = 2880, height = 2100 where cloudinary_public_id = '3. NEO BIZ Acquisition Customer Portal - Egypt - Jul 27/Arabic/Customer portal/49-resolved-queries-national-id-updated';
update media set width = 2880, height = 2360 where cloudinary_public_id = '3. NEO BIZ Acquisition Customer Portal - Egypt - Jul 27/Arabic/Customer portal/51-withdrawal-survey-reason-selected';
update media set width = 2880, height = 2048 where cloudinary_public_id = '3. NEO BIZ Acquisition Customer Portal - Egypt - Jul 27/Arabic/Customer portal/54-application-withdrawn-success';
update media set width = 1928, height = 1352 where cloudinary_public_id = '3. NEO BIZ Acquisition Customer Portal - Egypt - Jul 27/Arabic/Customer portal/55-modal-document-guidelines-company';
update media set width = 2880, height = 2570 where cloudinary_public_id = '3. NEO BIZ Acquisition Customer Portal - Egypt - Jul 27/Arabic/Customer portal/57-group-app-overview-with-queries';
update media set width = 2456, height = 1410 where cloudinary_public_id = '3. NEO BIZ Acquisition Customer Portal - Egypt - Jul 27/Arabic/Exceptians/61-query-update-tax-card';
update media set width = 2456, height = 974 where cloudinary_public_id = '3. NEO BIZ Acquisition Customer Portal - Egypt - Jul 27/Arabic/Exceptians/67-query-nature-of-business';
update media set width = 2880, height = 2048 where cloudinary_public_id = '3. NEO BIZ Acquisition Customer Portal - Egypt - Jul 27/English/Customer portal/01-app-overview-queries-awaiting-response';
update media set width = 2880, height = 2048 where cloudinary_public_id = '3. NEO BIZ Acquisition Customer Portal - Egypt - Jul 27/English/Customer portal/02-app-overview-submitted-no-queries';
update media set width = 2880, height = 2048 where cloudinary_public_id = '3. NEO BIZ Acquisition Customer Portal - Egypt - Jul 27/English/Customer portal/04-pending-queries-empty-state';
update media set width = 2880, height = 2048 where cloudinary_public_id = '3. NEO BIZ Acquisition Customer Portal - Egypt - Jul 27/English/Customer portal/06-pending-queries-tax-card-submitted';
update media set width = 2880, height = 2100 where cloudinary_public_id = '3. NEO BIZ Acquisition Customer Portal - Egypt - Jul 27/English/Customer portal/07-resolved-queries-national-id-updated';
update media set width = 2880, height = 2360 where cloudinary_public_id = '3. NEO BIZ Acquisition Customer Portal - Egypt - Jul 27/English/Customer portal/09-withdrawal-survey-reason-selected';
update media set width = 2880, height = 2048 where cloudinary_public_id = '3. NEO BIZ Acquisition Customer Portal - Egypt - Jul 27/English/Customer portal/12-application-withdrawn-success';
update media set width = 1928, height = 1296 where cloudinary_public_id = '3. NEO BIZ Acquisition Customer Portal - Egypt - Jul 27/English/Customer portal/13-modal-document-guidelines-company';
update media set width = 2880, height = 2570 where cloudinary_public_id = '3. NEO BIZ Acquisition Customer Portal - Egypt - Jul 27/English/Customer portal/15-group-app-overview-with-queries';
update media set width = 2456, height = 1426 where cloudinary_public_id = '3. NEO BIZ Acquisition Customer Portal - Egypt - Jul 27/English/Exceptians/19-query-update-tax-card';
update media set width = 2456, height = 974 where cloudinary_public_id = '3. NEO BIZ Acquisition Customer Portal - Egypt - Jul 27/English/Exceptians/25-query-nature-of-business';
update media set width = 2732, height = 2500 where cloudinary_public_id = '4. BB Egypt - Fulfilment - Jul 27/Application/33-application-documents-pending-verification';
update media set width = 2732, height = 3714 where cloudinary_public_id = '4. BB Egypt - Fulfilment - Jul 27/Application/36-application-documents-multi-signatory-with-signatures';
update media set width = 2732, height = 2210 where cloudinary_public_id = '4. BB Egypt - Fulfilment - Jul 27/Dashboard - Utilites/12-team-lead-dashboard-other-queue-view';
update media set width = 984, height = 1624 where cloudinary_public_id = '4. BB Egypt - Fulfilment - Jul 27/Dashboard - Utilites/16-modal-reassign-cairo-queue-officer-selection';
update media set width = 2732, height = 1800 where cloudinary_public_id = '4. BB Egypt - Fulfilment - Jul 27/Dashboard/07-officer-dashboard-scheduled-appointments';
update media set width = 2732, height = 2128 where cloudinary_public_id = '4. BB Egypt - Fulfilment - Jul 27/Dashboard/10-team-lead-dashboard-my-queue';
update media set width = 2732, height = 2070 where cloudinary_public_id = '4. BB Egypt - Fulfilment - Jul 27/application details - Utilites/23-application-details-partners';
update media set width = 2732, height = 1800 where cloudinary_public_id = '4. BB Egypt - Fulfilment - Jul 27/application details screen/03-otp-verification-empty';
update media set width = 2732, height = 1800 where cloudinary_public_id = '4. BB Egypt - Fulfilment - Jul 27/application details screen/06-otp-verification-locked-out';
update media set width = 1154, height = 1380 where cloudinary_public_id = '4. BB Egypt - Fulfilment - Jul 27/application details screen/24-modal-take-action-full-options';
update media set width = 814, height = 992 where cloudinary_public_id = '4. BB Egypt - Fulfilment - Jul 27/application details screen/28-phone-call-connecting';
update media set width = 984, height = 2116 where cloudinary_public_id = '4. BB Egypt - Fulfilment - Jul 27/application details screen/29-modal-call-feedback';
update media set width = 984, height = 1632 where cloudinary_public_id = '4. BB Egypt - Fulfilment - Jul 27/application details screen/30-modal-ask-to-reschedule';
update media set width = 1189, height = 1683 where cloudinary_public_id = '5. AOF (Account Opening Form) EGY - Jul 27/Pages/01-cover-page';
update media set width = 1189, height = 1683 where cloudinary_public_id = '5. AOF (Account Opening Form) EGY - Jul 27/Pages/05-ownership-details-shareholders-2-and-3';
update media set width = 1189, height = 1683 where cloudinary_public_id = '5. AOF (Account Opening Form) EGY - Jul 27/Pages/07-regulatory-declaration-fatca-and-pep';
update media set width = 1189, height = 1683 where cloudinary_public_id = '5. AOF (Account Opening Form) EGY - Jul 27/Pages/13-terms-and-conditions-digital-consent-form';
update media set width = 1200, height = 2530 where cloudinary_public_id = '6. Emailer''s (NEOBiz) EGYPT - Jul 27/Arabic/01-case-creation';
update media set width = 1200, height = 2482 where cloudinary_public_id = '6. Emailer''s (NEOBiz) EGYPT - Jul 27/Arabic/03-case-termination-alert-before-submission';
update media set width = 1200, height = 2918 where cloudinary_public_id = '6. Emailer''s (NEOBiz) EGYPT - Jul 27/Arabic/06-exception-raised-from-governance-partner-name';
update media set width = 1200, height = 3178 where cloudinary_public_id = '6. Emailer''s (NEOBiz) EGYPT - Jul 27/Arabic/07-reminder-on-raised-exception-by-governance-governance';
update media set width = 1200, height = 2454 where cloudinary_public_id = '6. Emailer''s (NEOBiz) EGYPT - Jul 27/English/01-case-creation';
update media set width = 1200, height = 2338 where cloudinary_public_id = '6. Emailer''s (NEOBiz) EGYPT - Jul 27/English/03-case-termination-alert-before-submission';
update media set width = 1200, height = 2640 where cloudinary_public_id = '6. Emailer''s (NEOBiz) EGYPT - Jul 27/English/06-exception-raised-from-governance-partner-name';
update media set width = 1200, height = 3158 where cloudinary_public_id = '6. Emailer''s (NEOBiz) EGYPT - Jul 27/English/07-reminder-on-raised-exception-by-governance';
update media set width = 750, height = 1624 where cloudinary_public_id = '7. EGY NEOBIZ - Mobile/Arabic/Application Dashboard/36-application-dashboard-initial';
update media set width = 750, height = 1714 where cloudinary_public_id = '7. EGY NEOBIZ - Mobile/Arabic/Application Dashboard/ownership-in-progress';
update media set width = 750, height = 1624 where cloudinary_public_id = '7. EGY NEOBIZ - Mobile/Arabic/Application Dashboard/plan-selected-collapsed';
update media set width = 750, height = 1624 where cloudinary_public_id = '7. EGY NEOBIZ - Mobile/Arabic/Application Dashboard/ready-to-submit';
update media set width = 750, height = 1624 where cloudinary_public_id = '7. EGY NEOBIZ - Mobile/Arabic/Company Structure/43-company-structure';
update media set width = 750, height = 2392 where cloudinary_public_id = '7. EGY NEOBIZ - Mobile/Arabic/Company Structure/45-company-structure-legal-status-partnership';
update media set width = 750, height = 1624 where cloudinary_public_id = '7. EGY NEOBIZ - Mobile/Arabic/Financial - Debit Card/yes-signatory-selected-joint';
update media set width = 750, height = 1624 where cloudinary_public_id = '7. EGY NEOBIZ - Mobile/Arabic/Upload Docs/upload-tips-modal';
update media set width = 750, height = 1624 where cloudinary_public_id = '7. EGY NEOBIZ - Mobile/Arabic/Upload Docs/with-contract-uploaded';
update media set width = 750, height = 1624 where cloudinary_public_id = '7. EGY NEOBIZ - Mobile/English/Application Dashboard/01-application-dashboard-initial';
update media set width = 750, height = 1734 where cloudinary_public_id = '7. EGY NEOBIZ - Mobile/English/Application Dashboard/ownership-in-progress';
update media set width = 750, height = 1624 where cloudinary_public_id = '7. EGY NEOBIZ - Mobile/English/Application Dashboard/plan-selected-collapsed';
update media set width = 750, height = 1624 where cloudinary_public_id = '7. EGY NEOBIZ - Mobile/English/Application Dashboard/ready-to-submit';
update media set width = 750, height = 1624 where cloudinary_public_id = '7. EGY NEOBIZ - Mobile/English/Company Structure/08-company-structure';
update media set width = 750, height = 2112 where cloudinary_public_id = '7. EGY NEOBIZ - Mobile/English/Company Structure/10-company-structure-legal-status-partnership';
update media set width = 750, height = 1624 where cloudinary_public_id = '7. EGY NEOBIZ - Mobile/English/Financial - Debit Card/yes-signatory-selected-joint';
update media set width = 750, height = 1624 where cloudinary_public_id = '7. EGY NEOBIZ - Mobile/English/Upload Docs/upload-tips-modal';
update media set width = 750, height = 1624 where cloudinary_public_id = '7. EGY NEOBIZ - Mobile/English/Upload Docs/with-contract-uploaded';
update media set width = 2048, height = 1152 where cloudinary_public_id = 'Cervello/Assets/all-assets';
update media set width = 2048, height = 1152 where cloudinary_public_id = 'Cervello/Assets/asset-dashboard';
update media set width = 2048, height = 1152 where cloudinary_public_id = 'Cervello/Assets/asset-hierarchy';
update media set width = 3315, height = 1206 where cloudinary_public_id = 'Cervello/Method/handoff-screens';
update media set width = 3560, height = 1123 where cloudinary_public_id = 'Cervello/Method/handoff-touchpoints';
update media set width = 2520, height = 1586 where cloudinary_public_id = 'Cervello/Method/idea-card-1';
update media set width = 2520, height = 1586 where cloudinary_public_id = 'Cervello/Method/idea-card-2';
update media set width = 2667, height = 1499 where cloudinary_public_id = 'Cervello/Method/wireframe-sign-up';
update media set width = 2667, height = 1499 where cloudinary_public_id = 'Cervello/Method/wireframe-workspace';
update media set width = 2880, height = 1620 where cloudinary_public_id = 'Cervello/Monitoring/alarm-tracking';
update media set width = 2880, height = 1620 where cloudinary_public_id = 'Cervello/Monitoring/alarms-by-location';
update media set width = 1366, height = 768 where cloudinary_public_id = 'Cervello/Onboarding/choose-instance';
update media set width = 1366, height = 768 where cloudinary_public_id = 'Cervello/Onboarding/confirm-plan';
update media set width = 1366, height = 768 where cloudinary_public_id = 'Cervello/Onboarding/instance-setup';
update media set width = 1366, height = 768 where cloudinary_public_id = 'Cervello/Onboarding/manage-instances';
update media set width = 1366, height = 768 where cloudinary_public_id = 'Cervello/Onboarding/setting-up-account';
update media set width = 1835, height = 1030 where cloudinary_public_id = 'Cervello/Sign up/magic-link';
update media set width = 1843, height = 1027 where cloudinary_public_id = 'Cervello/Sign up/setup-profile';
update media set width = 1838, height = 1032 where cloudinary_public_id = 'Cervello/Sign up/sign-up';
update media set width = 835, height = 304 where cloudinary_public_id = 'Cervello/User management/instance-landing';
update media set width = 2048, height = 1152 where cloudinary_public_id = 'Cervello/User management/instance-members';
update media set width = 2048, height = 1152 where cloudinary_public_id = 'Cervello/User management/organisation-landing';
update media set width = 2048, height = 1152 where cloudinary_public_id = 'Cervello/User management/team-members';
update media set width = 2048, height = 1152 where cloudinary_public_id = 'Cervello/User management/team-profile';
update media set width = 2048, height = 1152 where cloudinary_public_id = 'Cervello/User management/user-profile';
update media set width = 1536, height = 1024 where cloudinary_public_id = 'Cervello_-_Cover';
update media set width = 1536, height = 960 where cloudinary_public_id = 'Cervello_-_Cover-card';
update media set width = 4322, height = 4322 where cloudinary_public_id = 'EGY_-_NEOBIZ_-_Cover';
update media set width = 2560, height = 1600 where cloudinary_public_id = 'EGY_-_NEOBIZ_-_Cover-card';
update media set width = 2901, height = 2838 where cloudinary_public_id = 'Egypt Acquisition/Onboarding Journey/Arabic/Company details/company-profile-arabic-error';
update media set width = 2901, height = 2586 where cloudinary_public_id = 'Egypt Acquisition/Onboarding Journey/Arabic/Company details/company-profile-arabic-filled';
update media set width = 2880, height = 2174 where cloudinary_public_id = 'Egypt Acquisition/Onboarding Journey/Arabic/Company details/company-upload-arabic-all-documents-uploaded';
update media set width = 2901, height = 3138 where cloudinary_public_id = 'Egypt Acquisition/Onboarding Journey/Arabic/Company details/operational-details-arabic-error';
update media set width = 2880, height = 2304 where cloudinary_public_id = 'Egypt Acquisition/Onboarding Journey/Arabic/Onboard/Eligible new applicant/account-select-plan-arabic-prime-selected';
update media set width = 2880, height = 2134 where cloudinary_public_id = 'Egypt Acquisition/Onboarding Journey/Arabic/Onboard/Non Eligible new applicant/non-eligible-arabic-rm-assisted';
update media set width = 2880, height = 2048 where cloudinary_public_id = 'Egypt Acquisition/Onboarding Journey/Arabic/Onboard/Signup/registration-arabic-default';
update media set width = 2880, height = 2752 where cloudinary_public_id = 'Egypt Acquisition/Onboarding Journey/Arabic/Onboard/Signup/registration-arabic-filled';
update media set width = 2832, height = 2088 where cloudinary_public_id = 'Egypt Acquisition/Onboarding Journey/Arabic/Ownership details/Dashboard/key-individuals-arabic-multiple-added';
update media set width = 2880, height = 2614 where cloudinary_public_id = 'Egypt Acquisition/Onboarding Journey/Arabic/Ownership details/Key individual - data/confirm-individual-arabic-non-egyptian-filled';
update media set width = 2880, height = 2112 where cloudinary_public_id = 'Egypt Acquisition/Onboarding Journey/Arabic/Post-Submit/Scheduling visit/application-submitted-arabic-verification-choice';
update media set width = 1738, height = 1176 where cloudinary_public_id = 'Egypt Acquisition/Onboarding Journey/Arabic/Post-Submit/Scheduling visit/branch-selection-arabic';
update media set width = 2880, height = 2984 where cloudinary_public_id = 'Egypt Acquisition/Onboarding Journey/Arabic/Pre-Submit/Review/review-arabic';
update media set width = 2880, height = 1860 where cloudinary_public_id = 'Egypt Acquisition/Onboarding Journey/Arabic/Regulatory declaration/FATCA/fatca-arabic';
update media set width = 2880, height = 2048 where cloudinary_public_id = 'Egypt Acquisition/Onboarding Journey/Arabic/Regulatory declaration/FATCA/fatca-arabic-2';
update media set width = 2880, height = 2452 where cloudinary_public_id = 'Egypt Acquisition/Onboarding Journey/Arabic/Regulatory declaration/FATCA/fatca-arabic-non-financial';
update media set width = 2880, height = 3464 where cloudinary_public_id = 'Egypt Acquisition/Onboarding Journey/Arabic/Regulatory declaration/FATCA/fatca-arabic-non-financial-us-persons-2-ubos';
update media set width = 1928, height = 1204 where cloudinary_public_id = 'Egypt Acquisition/Onboarding Journey/Arabic/Regulatory declaration/PEP declarations/pep-info-modal-arabic';
update media set width = 1928, height = 2056 where cloudinary_public_id = 'Egypt Acquisition/Onboarding Journey/Arabic/Regulatory declaration/Sanction/modal-completion-details-arabic';
update media set width = 2880, height = 3748 where cloudinary_public_id = 'Egypt Acquisition/Onboarding Journey/Arabic/Regulatory declaration/Sanction/sanctions-arabic';
update media set width = 2880, height = 2890 where cloudinary_public_id = 'Egypt Acquisition/Onboarding Journey/English/Company details/company-details-error';
update media set width = 2880, height = 2666 where cloudinary_public_id = 'Egypt Acquisition/Onboarding Journey/English/Company details/company-details-partially-pre-populated';
update media set width = 2880, height = 2606 where cloudinary_public_id = 'Egypt Acquisition/Onboarding Journey/English/Company details/company-details-pre-filled';
update media set width = 2880, height = 3166 where cloudinary_public_id = 'Egypt Acquisition/Onboarding Journey/English/Company details/operational-details-international-branches-and-error';
update media set width = 2880, height = 2216 where cloudinary_public_id = 'Egypt Acquisition/Onboarding Journey/English/Onboard/Eligible new applicant/03-account-select-plan-prime-selected';
update media set width = 2880, height = 2118 where cloudinary_public_id = 'Egypt Acquisition/Onboarding Journey/English/Onboard/Non Eligible new applicant/04-non-eligible-rm-assisted';
update media set width = 2880, height = 2048 where cloudinary_public_id = 'Egypt Acquisition/Onboarding Journey/English/Onboard/Signup/01-sign-up-intiate';
update media set width = 3840, height = 2480 where cloudinary_public_id = 'Egypt Acquisition/Onboarding Journey/English/Ownership details/Dashboard/key-individuals-all-added';
update media set width = 2880, height = 2578 where cloudinary_public_id = 'Egypt Acquisition/Onboarding Journey/English/Ownership details/Key individual - data/confirm-individual-non-egyptian-non-resident-filled';
update media set width = 2880, height = 2220 where cloudinary_public_id = 'Egypt Acquisition/Onboarding Journey/English/Post-Submit/Scheduling visit/application-submitted-visit-selected';
update media set width = 1824, height = 1160 where cloudinary_public_id = 'Egypt Acquisition/Onboarding Journey/English/Post-Submit/Scheduling visit/mashreq-branches';
update media set width = 2880, height = 2670 where cloudinary_public_id = 'Egypt Acquisition/Onboarding Journey/English/Pre-Submit/Review/review-collapsed';
update media set width = 2880, height = 1944 where cloudinary_public_id = 'Egypt Acquisition/Onboarding Journey/English/Regulatory declaration/FATCA/fatca-default';
update media set width = 2880, height = 2048 where cloudinary_public_id = 'Egypt Acquisition/Onboarding Journey/English/Regulatory declaration/FATCA/fatca-default-2';
update media set width = 2880, height = 2862 where cloudinary_public_id = 'Egypt Acquisition/Onboarding Journey/English/Regulatory declaration/FATCA/fatca-non-financial-passive-us-citizens-yes-ubo-with-ssn';
update media set width = 1928, height = 1424 where cloudinary_public_id = 'Egypt Acquisition/Onboarding Journey/English/Regulatory declaration/PEP declarations/modal-pep-definition-english';
update media set width = 1928, height = 2264 where cloudinary_public_id = 'Egypt Acquisition/Onboarding Journey/English/Regulatory declaration/Sanction/modal-completion-details-english';
update media set width = 2880, height = 4120 where cloudinary_public_id = 'Egypt Acquisition/Onboarding Journey/English/Regulatory declaration/Sanction/sanctions-filled';
update media set width = 778, height = 825 where cloudinary_public_id = 'Gemini_Generated_Image_9jby0x9jby0x9jby-Photoroom';
update media set width = 2880, height = 1826 where cloudinary_public_id = 'Old-fatca';
update media set width = 1024, height = 768 where cloudinary_public_id = 'Slide_4_3_-_1';
update media set width = 2400, height = 2400 where cloudinary_public_id = 'uae-acquisition';
update media set width = 2560, height = 1600 where cloudinary_public_id = 'uae-acquisition-card';

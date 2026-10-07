-- Les comptes de démonstration (V2) avaient un mot de passe en clair : on le remplace par son hash BCrypt.
-- Mot de passe inchangé pour se connecter : password123
UPDATE users
SET password = '$2a$10$J2aXKFhrB.pUkHCmfsE24ePNeihOEHDrDfXMxOaOKQQldPPueQlD.'
WHERE password = 'password123';

<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260325083006 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TEMPORARY TABLE __temp__user AS SELECT id, email, password, username, roles FROM user');
        $this->addSql('DROP TABLE user');
        $this->addSql('CREATE TABLE user (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, email VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, username VARCHAR(30) NOT NULL, roles CLOB NOT NULL)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_8D93D649E7927C74 ON user (email)');
        $this->addSql('INSERT INTO user (id, email, password, username, roles) SELECT id, email, password, username, roles FROM __temp__user');
        $this->addSql("UPDATE user SET roles = '[\"ROLE_USER\"]' WHERE roles IS NULL OR roles = '' OR roles NOT LIKE '[%'");
        $this->addSql('DROP TABLE __temp__user');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TEMPORARY TABLE __temp__user AS SELECT id, email, password, username, roles FROM user');
        $this->addSql('DROP TABLE user');
        $this->addSql('CREATE TABLE user (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, email VARCHAR(255) NOT NULL, password VARCHAR(30) NOT NULL, username VARCHAR(30) NOT NULL, roles VARCHAR(30) NOT NULL)');
        $this->addSql('INSERT INTO user (id, email, password, username, roles) SELECT id, email, password, username, roles FROM __temp__user');
        $this->addSql('DROP TABLE __temp__user');
    }
}

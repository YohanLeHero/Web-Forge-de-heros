<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260324075659 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE character (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, name VARCHAR(60) NOT NULL, level INTEGER NOT NULL, strength INTEGER NOT NULL, dexterity INTEGER NOT NULL, constitution INTEGER NOT NULL, intelligence INTEGER NOT NULL, wisdom INTEGER NOT NULL, charisma INTEGER NOT NULL, health_point INTEGER NOT NULL, image BLOB DEFAULT NULL, user_id INTEGER NOT NULL, race_id INTEGER DEFAULT NULL, character_class_id INTEGER DEFAULT NULL, CONSTRAINT FK_937AB034A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_937AB0346E59D40D FOREIGN KEY (race_id) REFERENCES race (id) NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_937AB034B201E281 FOREIGN KEY (character_class_id) REFERENCES character_class (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE INDEX IDX_937AB034A76ED395 ON character (user_id)');
        $this->addSql('CREATE INDEX IDX_937AB0346E59D40D ON character (race_id)');
        $this->addSql('CREATE INDEX IDX_937AB034B201E281 ON character (character_class_id)');
        $this->addSql('CREATE TABLE character_class (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, name VARCHAR(60) NOT NULL, description VARCHAR(255) DEFAULT NULL, health_dice INTEGER NOT NULL)');
        $this->addSql('CREATE TABLE party (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, name VARCHAR(60) NOT NULL, description VARCHAR(255) DEFAULT NULL, max_size INTEGER NOT NULL, user_id INTEGER NOT NULL, CONSTRAINT FK_89954EE0A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE INDEX IDX_89954EE0A76ED395 ON party (user_id)');
        $this->addSql('CREATE TABLE party_character (party_id INTEGER NOT NULL, character_id INTEGER NOT NULL, PRIMARY KEY (party_id, character_id), CONSTRAINT FK_85BAD179213C1059 FOREIGN KEY (party_id) REFERENCES party (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_85BAD1791136BE75 FOREIGN KEY (character_id) REFERENCES character (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE INDEX IDX_85BAD179213C1059 ON party_character (party_id)');
        $this->addSql('CREATE INDEX IDX_85BAD1791136BE75 ON party_character (character_id)');
        $this->addSql('CREATE TABLE skill (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, name VARCHAR(30) NOT NULL, ability VARCHAR(30) NOT NULL)');
        $this->addSql('CREATE TABLE skill_character_class (skill_id INTEGER NOT NULL, character_class_id INTEGER NOT NULL, PRIMARY KEY (skill_id, character_class_id), CONSTRAINT FK_25498D685585C142 FOREIGN KEY (skill_id) REFERENCES skill (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_25498D68B201E281 FOREIGN KEY (character_class_id) REFERENCES character_class (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE INDEX IDX_25498D685585C142 ON skill_character_class (skill_id)');
        $this->addSql('CREATE INDEX IDX_25498D68B201E281 ON skill_character_class (character_class_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE character');
        $this->addSql('DROP TABLE character_class');
        $this->addSql('DROP TABLE party');
        $this->addSql('DROP TABLE party_character');
        $this->addSql('DROP TABLE skill');
        $this->addSql('DROP TABLE skill_character_class');
    }
}

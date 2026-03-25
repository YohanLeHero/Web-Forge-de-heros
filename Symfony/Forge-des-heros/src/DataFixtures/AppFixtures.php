<?php

namespace App\DataFixtures;

use App\Entity\CharacterClass;
use App\Entity\Race;
use App\Entity\Skill;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $races = $this->persistRaces($manager);
        $classes = $this->persistCharacterClasses($manager);
        $skills = $this->persistSkills($manager);

        $this->wireClassSkills($classes, $skills);

        $manager->flush();
    }

    /**
     * @return array<string, Race>
     */
    private function persistRaces(ObjectManager $manager): array
    {
        $defs = [
            'Humain' => 'Polyvalents et ambitieux, les humains sont la race la plus répandue.',
            'Elfe' => 'Gracieux et longévifs, les elfes possèdent une affinité naturelle avec la magie.',
            'Nain' => 'Robustes et tenaces, les nains sont des artisans et guerriers réputés.',
            'Halfelin' => 'Petits et agiles, les halfelins sont connus pour leur chance et leur discrétion.',
            'Demi-Orc' => 'Forts et endurants, les demi-orcs allient la puissance des orcs à l\'adaptabilité humaine.',
            'Gnome' => 'Curieux et inventifs, les gnomes excellent dans les domaines de la magie et de la technologie.',
            'Tieffelin' => 'Descendants d\'une lignée infernale, les tieffelins portent la marque de leur héritage.',
            'Demi-Elfe' => 'Héritant du meilleur des deux mondes, les demi-elfes sont diplomates et polyvalents.',
        ];

        $out = [];
        foreach ($defs as $name => $desc) {
            $r = new Race();
            $r->setName($name);
            $r->setDescription($desc);
            $manager->persist($r);
            $out[$name] = $r;
        }

        return $out;
    }

    /**
     * @return array<string, CharacterClass>
     */
    private function persistCharacterClasses(ObjectManager $manager): array
    {
        $defs = [
            'Barbare' => ['Guerrier sauvage animé par une rage dévastatrice.', 12],
            'Barde' => ['Artiste et conteur dont la musique possède un pouvoir magique.', 8],
            'Clerc' => ['Serviteur divin canalisant la puissance de sa divinité.', 8],
            'Druide' => ['Gardien de la nature capable de se métamorphoser.', 8],
            'Guerrier' => ['Maître des armes et des tactiques de combat.', 10],
            'Mage' => ['Érudit de l\'arcane maîtrisant de puissants sortilèges.', 6],
            'Paladin' => ['Chevalier sacré combinant prouesse martiale et magie divine.', 10],
            'Ranger' => ['Chasseur et pisteur expert des terres sauvages.', 10],
            'Sorcier' => ['Lanceur de sorts dont le pouvoir est inné et instinctif.', 6],
            'Voleur' => ['Spécialiste de la discrétion, du crochetage et des attaques sournoises.', 8],
        ];

        $out = [];
        foreach ($defs as $name => [$desc, $dice]) {
            $c = new CharacterClass();
            $c->setName($name);
            $c->setDescription($desc);
            $c->setHealthDice($dice);
            $manager->persist($c);
            $out[$name] = $c;
        }

        return $out;
    }

    /**
     * @return array<string, Skill>
     */
    private function persistSkills(ObjectManager $manager): array
    {
        $defs = [
            'Acrobaties' => 'DEX',
            'Arcanes' => 'INT',
            'Athlétisme' => 'STR',
            'Discrétion' => 'DEX',
            'Dressage' => 'WIS',
            'Escamotage' => 'DEX',
            'Histoire' => 'INT',
            'Intimidation' => 'CHA',
            'Investigation' => 'INT',
            'Médecine' => 'WIS',
            'Nature' => 'INT',
            'Perception' => 'WIS',
            'Perspicacité' => 'WIS',
            'Persuasion' => 'CHA',
            'Religion' => 'INT',
            'Représentation' => 'CHA',
            'Survie' => 'WIS',
            'Tromperie' => 'CHA',
        ];

        $out = [];
        foreach ($defs as $name => $ability) {
            $s = new Skill();
            $s->setName($name);
            $s->setAbility($ability);
            $manager->persist($s);
            $out[$name] = $s;
        }

        return $out;
    }

    /**
     * @param array<string, CharacterClass> $classes
     * @param array<string, Skill> $skills
     */
    private function wireClassSkills(array $classes, array $skills): void
    {
        // 2 à 4 compétences par classe (choix libres).
        $map = [
            'Barbare' => ['Athlétisme', 'Intimidation', 'Survie'],
            'Barde' => ['Représentation', 'Persuasion', 'Tromperie'],
            'Clerc' => ['Religion', 'Médecine', 'Perspicacité'],
            'Druide' => ['Nature', 'Dressage', 'Survie'],
            'Guerrier' => ['Athlétisme', 'Perception', 'Perspicacité'],
            'Mage' => ['Arcanes', 'Histoire', 'Investigation'],
            'Paladin' => ['Religion', 'Persuasion', 'Intimidation'],
            'Ranger' => ['Survie', 'Perception', 'Nature'],
            'Sorcier' => ['Arcanes', 'Tromperie'],
            'Voleur' => ['Discrétion', 'Escamotage', 'Acrobaties'],
        ];

        foreach ($map as $className => $skillNames) {
            foreach ($skillNames as $sn) {
                $classes[$className]->addSkill($skills[$sn]);
            }
        }
    }
}


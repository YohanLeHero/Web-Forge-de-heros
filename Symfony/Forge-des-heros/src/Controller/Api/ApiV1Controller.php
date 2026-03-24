<?php

namespace App\Controller\Api;

use App\Entity\Character;
use App\Entity\CharacterClass;
use App\Entity\Party;
use App\Entity\Race;
use App\Entity\Skill;
use App\Repository\CharacterClassRepository;
use App\Repository\CharacterRepository;
use App\Repository\PartyRepository;
use App\Repository\RaceRepository;
use App\Repository\SkillRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1')]
final class ApiV1Controller extends AbstractController
{
    #[Route('/races', name: 'api_v1_races_list', methods: ['GET'])]
    public function racesList(RaceRepository $raceRepository): JsonResponse
    {
        $races = $raceRepository->findBy([], ['id' => 'ASC']);

        return $this->json(array_map(fn (Race $r) => $this->raceToArray($r), $races));
    }

    #[Route('/races/{id}', name: 'api_v1_races_show', methods: ['GET'])]
    public function racesShow(int $id, RaceRepository $raceRepository): JsonResponse
    {
        $race = $raceRepository->find($id);
        if (!$race instanceof Race) {
            return $this->json(['error' => 'Race not found'], 404);
        }

        return $this->json($this->raceToArray($race));
    }

    #[Route('/classes', name: 'api_v1_classes_list', methods: ['GET'])]
    public function classesList(CharacterClassRepository $characterClassRepository): JsonResponse
    {
        $classes = $characterClassRepository->findBy([], ['id' => 'ASC']);

        return $this->json(array_map(fn (CharacterClass $c) => $this->characterClassSummary($c), $classes));
    }

    #[Route('/classes/{id}', name: 'api_v1_classes_show', methods: ['GET'])]
    public function classesShow(int $id, CharacterClassRepository $characterClassRepository): JsonResponse
    {
        $class = $characterClassRepository->find($id);
        if (!$class instanceof CharacterClass) {
            return $this->json(['error' => 'Class not found'], 404);
        }

        return $this->json($this->characterClassDetail($class));
    }

    #[Route('/skills', name: 'api_v1_skills_list', methods: ['GET'])]
    public function skillsList(SkillRepository $skillRepository): JsonResponse
    {
        $skills = $skillRepository->findBy([], ['id' => 'ASC']);

        return $this->json(array_map(fn (Skill $s) => $this->skillToArray($s), $skills));
    }

    #[Route('/characters', name: 'api_v1_characters_list', methods: ['GET'])]
    public function charactersList(Request $request, CharacterRepository $characterRepository): JsonResponse
    {
        $qb = $characterRepository->createQueryBuilder('c')
            ->leftJoin('c.race', 'r')->addSelect('r')
            ->leftJoin('c.characterClass', 'cc')->addSelect('cc')
            ->orderBy('c.id', 'ASC');

        $name = $request->query->get('name');
        if (is_string($name) && $name !== '') {
            $qb->andWhere('LOWER(c.name) LIKE :name')
                ->setParameter('name', '%'.mb_strtolower($name).'%');
        }

        $raceId = $request->query->get('race');
        if ($raceId !== null && $raceId !== '') {
            $qb->andWhere('r.id = :raceId')->setParameter('raceId', (int) $raceId);
        }

        $classId = $request->query->get('class');
        if ($classId !== null && $classId !== '') {
            $qb->andWhere('cc.id = :classId')->setParameter('classId', (int) $classId);
        }

        $characters = $qb->getQuery()->getResult();

        return $this->json(array_map(fn (Character $c) => $this->characterSummary($c), $characters));
    }

    #[Route('/characters/{id}', name: 'api_v1_characters_show', methods: ['GET'])]
    public function charactersShow(int $id, CharacterRepository $characterRepository): JsonResponse
    {
        $character = $characterRepository->find($id);
        if (!$character instanceof Character) {
            return $this->json(['error' => 'Character not found'], 404);
        }

        return $this->json($this->characterDetail($character));
    }

    #[Route('/parties', name: 'api_v1_parties_list', methods: ['GET'])]
    public function partiesList(Request $request, PartyRepository $partyRepository): JsonResponse
    {
        $filter = $request->query->get('filter');
        $parties = $partyRepository->findBy([], ['id' => 'ASC']);

        $out = [];
        foreach ($parties as $party) {
            $memberCount = $party->getCharacter()->count();
            if ($filter === 'full' && $memberCount < $party->getMaxSize()) {
                continue;
            }
            if ($filter === 'available' && $memberCount >= $party->getMaxSize()) {
                continue;
            }
            $out[] = $this->partySummary($party, $memberCount);
        }

        return $this->json($out);
    }

    #[Route('/parties/{id}', name: 'api_v1_parties_show', methods: ['GET'])]
    public function partiesShow(int $id, PartyRepository $partyRepository): JsonResponse
    {
        $party = $partyRepository->find($id);
        if (!$party instanceof Party) {
            return $this->json(['error' => 'Party not found'], 404);
        }

        return $this->json($this->partyDetail($party));
    }

    /**
     * @return array<string, mixed>
     */
    private function raceToArray(Race $race): array
    {
        return [
            'id' => $race->getId(),
            'name' => $race->getName(),
            'description' => $race->getDescription(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function skillToArray(Skill $skill): array
    {
        return [
            'id' => $skill->getId(),
            'name' => $skill->getName(),
            'ability' => $skill->getAbility(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function characterClassSummary(CharacterClass $class): array
    {
        return [
            'id' => $class->getId(),
            'name' => $class->getName(),
            'description' => $class->getDescription(),
            'healthDice' => $class->getHealthDice(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function characterClassDetail(CharacterClass $class): array
    {
        $skills = [];
        foreach ($class->getSkills() as $skill) {
            $skills[] = $this->skillToArray($skill);
        }

        return [
            'id' => $class->getId(),
            'name' => $class->getName(),
            'description' => $class->getDescription(),
            'healthDice' => $class->getHealthDice(),
            'skills' => $skills,
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function raceRef(?Race $race): ?array
    {
        if (!$race instanceof Race) {
            return null;
        }

        return [
            'id' => $race->getId(),
            'name' => $race->getName(),
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function classRef(?CharacterClass $class): ?array
    {
        if (!$class instanceof CharacterClass) {
            return null;
        }

        return [
            'id' => $class->getId(),
            'name' => $class->getName(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function characterSummary(Character $character): array
    {
        return [
            'id' => $character->getId(),
            'name' => $character->getName(),
            'level' => $character->getLevel(),
            'image' => $this->imageToBase64($character->getImage()),
            'race' => $this->raceRef($character->getRace()),
            'characterClass' => $this->classRef($character->getCharacterClass()),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function characterDetail(Character $character): array
    {
        $class = $character->getCharacterClass();
        $skills = [];
        if ($class instanceof CharacterClass) {
            foreach ($class->getSkills() as $skill) {
                $skills[] = $this->skillToArray($skill);
            }
        }

        $parties = [];
        foreach ($character->getParties() as $party) {
            $n = $party->getCharacter()->count();
            $parties[] = [
                'id' => $party->getId(),
                'name' => $party->getName(),
                'maxSize' => $party->getMaxSize(),
                'memberCount' => $n,
            ];
        }

        return [
            'id' => $character->getId(),
            'name' => $character->getName(),
            'level' => $character->getLevel(),
            'strength' => $character->getStrength(),
            'dexterity' => $character->getDexterity(),
            'constitution' => $character->getConstitution(),
            'intelligence' => $character->getIntelligence(),
            'wisdom' => $character->getWisdom(),
            'charisma' => $character->getCharisma(),
            'healthPoint' => $character->getHealthPoint(),
            'image' => $this->imageToBase64($character->getImage()),
            'race' => $this->raceRef($character->getRace()),
            'characterClass' => $this->classRef($class),
            'skills' => $skills,
            'parties' => $parties,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function partySummary(Party $party, int $memberCount): array
    {
        return [
            'id' => $party->getId(),
            'name' => $party->getName(),
            'description' => $party->getDescription(),
            'maxSize' => $party->getMaxSize(),
            'memberCount' => $memberCount,
            'placesLeft' => max(0, $party->getMaxSize() - $memberCount),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function partyDetail(Party $party): array
    {
        $memberCount = $party->getCharacter()->count();
        $members = [];
        foreach ($party->getCharacter() as $character) {
            $members[] = $this->characterSummary($character);
        }

        return [
            'id' => $party->getId(),
            'name' => $party->getName(),
            'description' => $party->getDescription(),
            'maxSize' => $party->getMaxSize(),
            'memberCount' => $memberCount,
            'placesLeft' => max(0, $party->getMaxSize() - $memberCount),
            'members' => $members,
        ];
    }

    private function imageToBase64(?string $binary): ?string
    {
        if ($binary === null || $binary === '') {
            return null;
        }

        return base64_encode($binary);
    }
}

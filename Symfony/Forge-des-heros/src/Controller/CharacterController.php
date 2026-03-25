<?php

namespace App\Controller;

use App\Entity\Character;
use App\Form\CharacterFormType;
use App\Repository\CharacterRepository;
use App\Repository\CharacterClassRepository;
use App\Repository\RaceRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/characters')]
final class CharacterController extends AbstractController
{
    #[Route('', name: 'app_characters_index', methods: ['GET'])]
    public function index(
        CharacterRepository $repo,
        Request $request,
        RaceRepository $raceRepository,
        CharacterClassRepository $characterClassRepository,
    ): Response
    {
        $q = $request->query->getString('q');
        $raceId = $request->query->get('race');
        $classId = $request->query->get('class');

        $qb = $repo->createQueryBuilder('c')
            ->andWhere('c.User = :u')
            ->setParameter('u', $this->getUser())
            ->orderBy('c.id', 'DESC');

        if ($q !== '') {
            $qb->andWhere('LOWER(c.name) LIKE :q')
                ->setParameter('q', '%'.mb_strtolower($q).'%');
        }

        if ($raceId !== null && $raceId !== '') {
            $qb->andWhere('c.race = :race')
                ->setParameter('race', (int) $raceId);
        }

        if ($classId !== null && $classId !== '') {
            $qb->andWhere('c.characterClass = :class')
                ->setParameter('class', (int) $classId);
        }

        $races = $raceRepository->findBy([], ['id' => 'ASC']);
        $classes = $characterClassRepository->findBy([], ['id' => 'ASC']);

        return $this->render('character/index.html.twig', [
            'characters' => $qb->getQuery()->getResult(),
            'q' => $q,
            'raceId' => $raceId,
            'classId' => $classId,
            'races' => $races,
            'classes' => $classes,
        ]);
    }

    #[Route('/new', name: 'app_characters_new', methods: ['GET', 'POST'])]
    public function new(Request $request, EntityManagerInterface $em): Response
    {
        $character = new Character();
        $character->setUser($this->getUser());
        $character->setLevel(1);

        $form = $this->createForm(CharacterFormType::class, $character);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $this->applyUploadedAvatar($form->get('imageFile')->getData(), $character);

            $class = $character->getCharacterClass();
            if ($class !== null) {
                $con = (int) $character->getConstitution();
                $conMod = (int) floor(($con - 10) / 2);
                $character->setHealthPoint((int) $class->getHealthDice() + $conMod);
            }

            $em->persist($character);
            $em->flush();

            return $this->redirectToRoute('app_characters_index');
        }

        return $this->render('character/form.html.twig', [
            'form' => $form,
            'mode' => 'new',
        ]);
    }

    #[Route('/{id}', name: 'app_characters_show', methods: ['GET'])]
    public function show(Character $character): Response
    {
        if ($character->getUser() !== $this->getUser()) {
            throw $this->createAccessDeniedException();
        }

        $imageBase64 = null;
        $imageMime = null;
        $raw = $character->getImage();
        if ($raw !== null && $raw !== '') {
            $imageBase64 = base64_encode($raw);
            $imageMime = self::guessImageMime($raw);
        }

        return $this->render('character/show.html.twig', [
            'character' => $character,
            'imageBase64' => $imageBase64,
            'imageMime' => $imageMime,
        ]);
    }

    #[Route('/{id}/edit', name: 'app_characters_edit', methods: ['GET', 'POST'])]
    public function edit(Character $character, Request $request, EntityManagerInterface $em): Response
    {
        if ($character->getUser() !== $this->getUser()) {
            throw $this->createAccessDeniedException();
        }

        $form = $this->createForm(CharacterFormType::class, $character);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $this->applyUploadedAvatar($form->get('imageFile')->getData(), $character);

            $class = $character->getCharacterClass();
            if ($class !== null) {
                $con = (int) $character->getConstitution();
                $conMod = (int) floor(($con - 10) / 2);
                $character->setHealthPoint((int) $class->getHealthDice() + $conMod);
            }

            $em->flush();

            return $this->redirectToRoute('app_characters_show', ['id' => $character->getId()]);
        }

        return $this->render('character/form.html.twig', [
            'form' => $form,
            'mode' => 'edit',
            'character' => $character,
        ]);
    }

    #[Route('/{id}/delete', name: 'app_characters_delete', methods: ['POST'])]
    public function delete(Character $character, Request $request, EntityManagerInterface $em): Response
    {
        if ($character->getUser() !== $this->getUser()) {
            throw $this->createAccessDeniedException();
        }

        if ($this->isCsrfTokenValid('delete_character_'.$character->getId(), (string) $request->request->get('_token'))) {
            $em->remove($character);
            $em->flush();
        }

        return $this->redirectToRoute('app_characters_index');
    }

    private function applyUploadedAvatar(mixed $file, Character $character): void
    {
        if (!$file instanceof UploadedFile || !$file->isValid()) {
            return;
        }

        try {
            $character->setImage($file->getContent());
        } catch (\Throwable) {
            $character->setImage(null);
        }
    }

    private static function guessImageMime(string $binary): string
    {
        if ($binary === '') {
            return 'application/octet-stream';
        }

        $head = substr($binary, 0, 16);
        if (str_starts_with($head, "\xFF\xD8\xFF")) {
            return 'image/jpeg';
        }
        if (str_starts_with($head, "\x89PNG\r\n\x1a\n")) {
            return 'image/png';
        }
        if (str_starts_with($head, 'GIF87a') || str_starts_with($head, 'GIF89a')) {
            return 'image/gif';
        }
        if (strlen($head) >= 12 && str_starts_with($head, 'RIFF') && substr($head, 8, 4) === 'WEBP') {
            return 'image/webp';
        }

        return 'application/octet-stream';
    }
}


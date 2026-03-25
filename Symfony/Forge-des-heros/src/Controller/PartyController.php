<?php

namespace App\Controller;

use App\Entity\Character;
use App\Entity\Party;
use App\Form\PartyFormType;
use App\Repository\CharacterRepository;
use App\Repository\PartyRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/parties')]
final class PartyController extends AbstractController
{
    #[Route('', name: 'app_parties_index', methods: ['GET'])]
    public function index(PartyRepository $repo, Request $request): Response
    {
        $filter = strtolower($request->query->getString('filter')); // full|available|complet|disponible
        if ($filter === 'complet') $filter = 'full';
        if ($filter === 'disponible') $filter = 'available';
        $parties = $repo->findBy([], ['id' => 'DESC']);

        $out = [];
        foreach ($parties as $p) {
            $count = $p->getCharacter()->count();
            if ($filter === 'full' && $count < $p->getMaxSize()) {
                continue;
            }
            if ($filter === 'available' && $count >= $p->getMaxSize()) {
                continue;
            }
            $out[] = ['party' => $p, 'count' => $count];
        }

        return $this->render('party/index.html.twig', [
            'parties' => $out,
            'filter' => $filter,
        ]);
    }

    #[Route('/new', name: 'app_parties_new', methods: ['GET', 'POST'])]
    public function new(Request $request, EntityManagerInterface $em): Response
    {
        $party = new Party();
        $party->setUser($this->getUser());

        $form = $this->createForm(PartyFormType::class, $party);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em->persist($party);
            $em->flush();

            return $this->redirectToRoute('app_parties_show', ['id' => $party->getId()]);
        }

        return $this->render('party/form.html.twig', [
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'app_parties_show', methods: ['GET'])]
    public function show(Party $party, CharacterRepository $characterRepository): Response
    {
        $memberCount = $party->getCharacter()->count();
        $myCharacters = $characterRepository->findBy(['User' => $this->getUser()], ['id' => 'DESC']);

        return $this->render('party/show.html.twig', [
            'party' => $party,
            'memberCount' => $memberCount,
            'myCharacters' => $myCharacters,
        ]);
    }

    #[Route('/{id}/join', name: 'app_parties_join', methods: ['POST'])]
    public function join(
        Party $party,
        Request $request,
        EntityManagerInterface $em,
        CharacterRepository $characterRepository,
    ): Response {
        $characterId = (int) $request->request->get('characterId');
        $character = $characterRepository->find($characterId);

        if (!$character instanceof Character || $character->getUser() !== $this->getUser()) {
            throw $this->createAccessDeniedException();
        }

        $memberCount = $party->getCharacter()->count();
        if ($memberCount >= $party->getMaxSize()) {
            $this->addFlash('error', 'Party is full.');
            return $this->redirectToRoute('app_parties_show', ['id' => $party->getId()]);
        }

        $party->addCharacter($character);
        $em->flush();

        return $this->redirectToRoute('app_parties_show', ['id' => $party->getId()]);
    }

    #[Route('/{id}/leave', name: 'app_parties_leave', methods: ['POST'])]
    public function leave(
        Party $party,
        Request $request,
        EntityManagerInterface $em,
        CharacterRepository $characterRepository,
    ): Response {
        $characterId = (int) $request->request->get('characterId');
        $character = $characterRepository->find($characterId);

        if (!$character instanceof Character || $character->getUser() !== $this->getUser()) {
            throw $this->createAccessDeniedException();
        }

        $party->removeCharacter($character);
        $em->flush();

        return $this->redirectToRoute('app_parties_show', ['id' => $party->getId()]);
    }
}


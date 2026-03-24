<?php

namespace App\Entity;

use App\Repository\SkillRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: SkillRepository::class)]
class Skill
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 30)]
    private ?string $name = null;

    #[ORM\Column(length: 30)]
    private ?string $ability = null;

    /**
     * @var Collection<int, CharacterClass>
     */
    #[ORM\ManyToMany(targetEntity: CharacterClass::class, inversedBy: 'skills')]
    private Collection $characterClass;

    public function __construct()
    {
        $this->characterClass = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getAbility(): ?string
    {
        return $this->ability;
    }

    public function setAbility(string $ability): static
    {
        $this->ability = $ability;

        return $this;
    }

    /**
     * @return Collection<int, CharacterClass>
     */
    public function getCharacterClass(): Collection
    {
        return $this->characterClass;
    }

    public function addCharacterClass(CharacterClass $characterClass): static
    {
        if (!$this->characterClass->contains($characterClass)) {
            $this->characterClass->add($characterClass);
        }

        return $this;
    }

    public function removeCharacterClass(CharacterClass $characterClass): static
    {
        $this->characterClass->removeElement($characterClass);

        return $this;
    }
}

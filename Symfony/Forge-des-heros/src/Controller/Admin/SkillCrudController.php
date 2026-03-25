<?php

namespace App\Controller\Admin;

use App\Entity\Skill;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;

final class SkillCrudController extends AbstractCrudController
{
    private const ABILITIES = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

    public static function getEntityFqcn(): string
    {
        return Skill::class;
    }

    public function configureFields(string $pageName): iterable
    {
        return [
            IdField::new('id')->hideOnForm(),
            TextField::new('name'),
            ChoiceField::new('ability')->setChoices(array_combine(self::ABILITIES, self::ABILITIES)),
        ];
    }
}


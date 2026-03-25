<?php

namespace App\Controller\Admin;

use App\Entity\CharacterClass;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IntegerField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextareaField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;

final class CharacterClassCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return CharacterClass::class;
    }

    public function configureFields(string $pageName): iterable
    {
        return [
            IdField::new('id')->hideOnForm(),
            TextField::new('name'),
            IntegerField::new('healthDice'),
            TextareaField::new('description')->hideOnIndex(),
            AssociationField::new('skills')->onlyOnForms(),
        ];
    }
}


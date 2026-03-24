<?php

namespace App\Controller\Admin;

use App\Entity\Character;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextEditorField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;






class CharacterCrudController extends AbstractCrudController
{
    #[AdminDashboard(routePath: '/user/create_Character', routeName: 'create_Character', routes: [
    'index' => ['routePath' => '/all'],
    'new' => ['routePath' => '/create', 'routeName' => 'create'],
    'edit' => ['routePath' => '/editing-{entityId}', 'routeName' => 'editing'],
    'delete' => ['routePath' => '/remove/{entityId}'],
    'detail' => ['routeName' => 'view'],
    ])]
    #[Route('/user/create_Character', name: 'create_Character')]
    public static function getEntityFqcn(): string
    {
        return Character::class;
    }

    /*
    public function configureFields(string $pageName): iterable
    {
        return [
            IdField::new('id'),
            TextField::new('title'),
            TextEditorField::new('description'),
        ];
    }
    */
}

<?php

namespace App\Form;

use App\Entity\Character;
use App\Entity\CharacterClass;
use App\Entity\Race;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormError;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Callback;
use Symfony\Component\Validator\Constraints\File;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\Range;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

final class CharacterFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('name', TextType::class, [
                'constraints' => [
                    new NotBlank(),
                    new Length(min: 2, max: 60),
                ],
            ])
            ->add('level', IntegerType::class, [
                'constraints' => [new Range(min: 1, max: 20)],
            ])
            ->add('race', EntityType::class, [
                'class' => Race::class,
                'choice_label' => 'name',
                'placeholder' => 'Choose a race',
                'required' => true,
            ])
            ->add('characterClass', EntityType::class, [
                'class' => CharacterClass::class,
                'choice_label' => 'name',
                'placeholder' => 'Choose a class',
                'required' => true,
            ])
            ->add('imageFile', FileType::class, [
                'mapped' => false,
                'required' => false,
                'constraints' => [
                    // maxSize only: mimeTypes would call MimeTypes::guessMimeType() which needs ext-fileinfo
                    new File(maxSize: '2M'),
                    new Callback(function (mixed $value, ExecutionContextInterface $context): void {
                        if (!$value instanceof UploadedFile || !$value->isValid()) {
                            return;
                        }
                        $ext = strtolower(pathinfo($value->getClientOriginalName(), \PATHINFO_EXTENSION));
                        if (!\in_array($ext, ['png', 'jpg', 'jpeg', 'webp', 'gif'], true)) {
                            $context->buildViolation('Please upload a PNG, JPEG, WebP, or GIF file.')
                                ->addViolation();
                        }
                    }),
                ],
            ])
            ->add('strength', IntegerType::class, ['constraints' => [new Range(min: 8, max: 15)]])
            ->add('dexterity', IntegerType::class, ['constraints' => [new Range(min: 8, max: 15)]])
            ->add('constitution', IntegerType::class, ['constraints' => [new Range(min: 8, max: 15)]])
            ->add('intelligence', IntegerType::class, ['constraints' => [new Range(min: 8, max: 15)]])
            ->add('wisdom', IntegerType::class, ['constraints' => [new Range(min: 8, max: 15)]])
            ->add('charisma', IntegerType::class, ['constraints' => [new Range(min: 8, max: 15)]]);

        $builder->addEventListener(FormEvents::POST_SUBMIT, function (FormEvent $event): void {
            $form = $event->getForm();
            $data = $event->getData();
            if (!$data instanceof Character) {
                return;
            }

            $stats = [
                $data->getStrength(),
                $data->getDexterity(),
                $data->getConstitution(),
                $data->getIntelligence(),
                $data->getWisdom(),
                $data->getCharisma(),
            ];

            if (in_array(null, $stats, true)) {
                return;
            }

            $spent = array_sum(array_map(static fn (int $v): int => $v - 8, $stats));
            if ($spent > 27) {
                $form->addError(new FormError('Point buy invalid: you can spend at most 27 points.'));
            }
        });
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Character::class,
        ]);
    }
}


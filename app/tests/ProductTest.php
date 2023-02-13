<?php

declare(strict_types=1);

use App\DataFixtures\ProductFixtures;
use App\Entity\Product;
use App\Repository\ProductRepository;
use Doctrine\ORM\EntityManagerInterface;
use Liip\TestFixturesBundle\Services\DatabaseToolCollection;
use Liip\TestFixturesBundle\Services\DatabaseTools\AbstractDatabaseTool;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

class ProductTest extends KernelTestCase
{
    protected AbstractDatabaseTool $databaseTool;
    protected ?EntityManagerInterface $entityManager;

    /**
     * @throws \Exception
     */
    public function setUp(): void
    {
        parent::setUp();

        $this->databaseTool = static::getContainer()->get(DatabaseToolCollection::class)->get();
        $this->entityManager = static::getContainer()->get(EntityManagerInterface::class);
    }

    /**
     * @throws \PHPUnit\Framework\MockObject\Exception
     */
    public function testProductEntity()
    {
        $this->databaseTool->loadFixtures([
            ProductFixtures::class
        ]);
        $productRepository = $this->createMock(ProductRepository::class);

        $products = $this->entityManager->getRepository(Product::class)->findAll();

        self::assertCount(20, $products);

        $product = new Product();
        $product->setName('Test name');
        $product->setDescription('Test description');
        $product->setCategory('Test category');
        $product->setWeight('100g');


        $productRepository->expects($this->any())
            ->method('find')
            ->willReturn($product);

        $this->assertEquals('Test name', $product->getName());
        $this->assertEquals('Test description', $product->getDescription());
        $this->assertEquals('Test category', $product->getCategory());
        $this->assertEquals('100g', $product->getWeight());
    }

}
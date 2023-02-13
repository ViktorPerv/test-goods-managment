<?php

declare(strict_types=1);

namespace Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class RouteControllerTest extends WebTestCase
{

    public function testIndex()
    {

        $client = static::createClient();

        $client->request('GET', '/test');
        $this->assertResponseStatusCodeSame(404);

        $client->request('GET', '/');
        $this->assertResponseIsSuccessful();
        $this->assertEquals(200, $client->getResponse()->getStatusCode());

        $client->request('GET',  '/product');
        $this->assertResponseIsSuccessful();
        $this->assertEquals(200, $client->getResponse()->getStatusCode());

        $client->request('GET',  '/product/load');
        $this->assertResponseIsSuccessful();
        $this->assertEquals(200, $client->getResponse()->getStatusCode());


        $client->request('GET',  '/product/load?start=10&length=10');
        $this->assertResponseIsSuccessful();
        $this->assertEquals(200, $client->getResponse()->getStatusCode());


        $client->request('GET',  '/product/load?&search[value]=test');
        $this->assertResponseIsSuccessful();
        $this->assertEquals(200, $client->getResponse()->getStatusCode());

    }

}


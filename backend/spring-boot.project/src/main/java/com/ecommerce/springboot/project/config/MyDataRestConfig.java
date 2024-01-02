package com.ecommerce.springboot.project.config;

import com.ecommerce.springboot.project.entity.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.rest.core.config.RepositoryRestConfiguration;
import org.springframework.data.rest.webmvc.config.RepositoryRestConfigurer;
import org.springframework.http.HttpMethod;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import jakarta.persistence.EntityManager;
import jakarta.persistence.metamodel.EntityType;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Configuration
public class MyDataRestConfig implements RepositoryRestConfigurer {

    @Value("${allowed.origins}")
    private String[] theAllowedOrigins;
    private EntityManager entityManager;

    @Autowired
    public MyDataRestConfig(EntityManager theEntityManager){
        entityManager = theEntityManager;
    }
    @Override
    public void configureRepositoryRestConfiguration(RepositoryRestConfiguration config, CorsRegistry cors) {


        RepositoryRestConfigurer.super.configureRepositoryRestConfiguration(config, cors);

        HttpMethod[] theUnssuportedActions = {HttpMethod.PUT, HttpMethod.POST,
                HttpMethod.DELETE, HttpMethod.PATCH};


        disableHttpMethods(Product.class, config, theUnssuportedActions);
        disableHttpMethods(ProductCategory.class, config, theUnssuportedActions);

        disableHttpMethods(Country.class, config, theUnssuportedActions);
        disableHttpMethods(State.class, config, theUnssuportedActions);
        disableHttpMethods(Order.class, config, theUnssuportedActions);


        // cALL an internal helper method to exspose id
        exposeIds(config);

        //configure cors mapping
        cors.addMapping(config.getBasePath() + "/**").allowedOrigins(theAllowedOrigins);
    }

    private static void disableHttpMethods(Class theClass, RepositoryRestConfiguration config, HttpMethod[] theUnssuportedActions) {
        config.getExposureConfiguration()
                .forDomainType(theClass)
                .withItemExposure((metdata, httpMethods) -> httpMethods.disable(theUnssuportedActions))
                .withCollectionExposure((metdata, httpMethods) -> httpMethods.disable(theUnssuportedActions));
    }

    private void exposeIds(RepositoryRestConfiguration config) {


        //get list of all entity classes from the entity manager
        Set<EntityType<?>> entities = entityManager.getMetamodel().getEntities();

        // -create an array of the entity types
        List<Class> entityClasses = new ArrayList<>();

        // get the entity type for the entities
        for (EntityType tempEntityType : entities){
            entityClasses.add(tempEntityType.getJavaType());
        }

        //expose the entity ids for the array enity/domain type

        Class[] domainTypes = entityClasses.toArray(new Class[0]);
        config.exposeIdsFor(domainTypes);


    }
}



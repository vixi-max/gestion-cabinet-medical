package com.exemple.patient_medical_service.repository;

import com.exemple.patient_medical_service.model.Facture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FactureRepository extends JpaRepository<Facture,Integer> {
}

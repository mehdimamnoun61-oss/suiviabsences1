<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TestDataSeeder extends Seeder
{
    public function run(): void
    {
        // ── Classes ──────────────────────────────────────────────────────
        DB::table('classes')->insert([
            ['id'=>1, 'nom_classe'=>'TSDI-2', 'filiere'=>'Developpement Informatique', 'niveau'=>'Technicien Specialise 2eme annee', 'groupe'=>'A', 'annee_scolaire'=>'2025/2026', 'created_at'=>now(), 'updated_at'=>now()],
            ['id'=>2, 'nom_classe'=>'TSDI-1', 'filiere'=>'Developpement Informatique', 'niveau'=>'Technicien Specialise 1ere annee', 'groupe'=>'B', 'annee_scolaire'=>'2025/2026', 'created_at'=>now(), 'updated_at'=>now()],
            ['id'=>3, 'nom_classe'=>'GC-1',   'filiere'=>'Genie Civil',                'niveau'=>'Technicien 1ere annee',            'groupe'=>'A', 'annee_scolaire'=>'2025/2026', 'created_at'=>now(), 'updated_at'=>now()],
        ]);

        // ── Enseignants ───────────────────────────────────────────────────
        DB::table('enseignants')->insert([
            ['id'=>1, 'nom'=>'Idrissi',  'prenom'=>'Karim',  'email'=>'k.idrissi@epg.ma',  'tel'=>'0661000001', 'specialite'=>'Programmation Web',  'created_at'=>now(), 'updated_at'=>now()],
            ['id'=>2, 'nom'=>'Jebari',   'prenom'=>'Sanaa',  'email'=>'s.jebari@epg.ma',   'tel'=>'0661000002', 'specialite'=>'Bases de donnees',    'created_at'=>now(), 'updated_at'=>now()],
            ['id'=>3, 'nom'=>'Karimi',   'prenom'=>'Rachid', 'email'=>'r.karimi@epg.ma',   'tel'=>'0661000003', 'specialite'=>'Mathematiques',       'created_at'=>now(), 'updated_at'=>now()],
        ]);

        // ── Modules ───────────────────────────────────────────────────────
        DB::table('modules')->insert([
            ['id'=>1, 'nom_module'=>'Programmation Web',  'volume_horaire'=>40, 'created_at'=>now(), 'updated_at'=>now()],
            ['id'=>2, 'nom_module'=>'Bases de donnees',   'volume_horaire'=>35, 'created_at'=>now(), 'updated_at'=>now()],
            ['id'=>3, 'nom_module'=>'Mathematiques',      'volume_horaire'=>30, 'created_at'=>now(), 'updated_at'=>now()],
        ]);

        // ── Etudiants ─────────────────────────────────────────────────────
        DB::table('etudiants')->insert([
            ['id'=>1,  'nom'=>'Benjelloun', 'prenom'=>'Mahmoud', 'email'=>'m.benjelloun@epg.ma', 'tel'=>'0612000001', 'date_naissance'=>'2002-03-15', 'sex'=>'homme', 'classe_id'=>1, 'created_at'=>now(), 'updated_at'=>now()],
            ['id'=>2,  'nom'=>'Boukhari',   'prenom'=>'Hamza',   'email'=>'h.boukhari@epg.ma',   'tel'=>'0612000002', 'date_naissance'=>'2002-07-22', 'sex'=>'homme', 'classe_id'=>1, 'created_at'=>now(), 'updated_at'=>now()],
            ['id'=>3,  'nom'=>'Choujaa',    'prenom'=>'Houssam', 'email'=>'h.choujaa@epg.ma',    'tel'=>'0612000003', 'date_naissance'=>'2001-11-05', 'sex'=>'homme', 'classe_id'=>1, 'created_at'=>now(), 'updated_at'=>now()],
            ['id'=>4,  'nom'=>'El Ouazzani','prenom'=>'Naoufel', 'email'=>'n.elouazzani@epg.ma', 'tel'=>'0612000004', 'date_naissance'=>'2002-01-30', 'sex'=>'homme', 'classe_id'=>1, 'created_at'=>now(), 'updated_at'=>now()],
            ['id'=>5,  'nom'=>'Lahsini',    'prenom'=>'Ismail',  'email'=>'i.lahsini@epg.ma',    'tel'=>'0612000005', 'date_naissance'=>'2001-09-18', 'sex'=>'homme', 'classe_id'=>1, 'created_at'=>now(), 'updated_at'=>now()],
            ['id'=>6,  'nom'=>'Alami',      'prenom'=>'Sara',    'email'=>'s.alami@epg.ma',      'tel'=>'0612000006', 'date_naissance'=>'2002-05-12', 'sex'=>'femme', 'classe_id'=>2, 'created_at'=>now(), 'updated_at'=>now()],
            ['id'=>7,  'nom'=>'Benali',     'prenom'=>'Fatima',  'email'=>'f.benali@epg.ma',     'tel'=>'0612000007', 'date_naissance'=>'2002-08-25', 'sex'=>'femme', 'classe_id'=>2, 'created_at'=>now(), 'updated_at'=>now()],
            ['id'=>8,  'nom'=>'Chakir',     'prenom'=>'Omar',    'email'=>'o.chakir@epg.ma',     'tel'=>'0612000008', 'date_naissance'=>'2001-04-09', 'sex'=>'homme', 'classe_id'=>3, 'created_at'=>now(), 'updated_at'=>now()],
        ]);

        // ── Affectations ──────────────────────────────────────────────────
        DB::table('affectations')->insert([
            ['id'=>1, 'enseignant_id'=>1, 'module_id'=>1, 'classe_id'=>1, 'annee_scolaire'=>'2025/2026', 'created_at'=>now(), 'updated_at'=>now()],
            ['id'=>2, 'enseignant_id'=>2, 'module_id'=>2, 'classe_id'=>1, 'annee_scolaire'=>'2025/2026', 'created_at'=>now(), 'updated_at'=>now()],
            ['id'=>3, 'enseignant_id'=>1, 'module_id'=>1, 'classe_id'=>2, 'annee_scolaire'=>'2025/2026', 'created_at'=>now(), 'updated_at'=>now()],
            ['id'=>4, 'enseignant_id'=>3, 'module_id'=>3, 'classe_id'=>3, 'annee_scolaire'=>'2025/2026', 'created_at'=>now(), 'updated_at'=>now()],
        ]);

        // ── Seances (4 semaines: 15/12 → 09/01) ──────────────────────────
        DB::table('seances')->insert([
            // Semaine 1 — 15-19 Dec
            ['id'=>1,  'affectation_id'=>1, 'date_seance'=>'2025-12-15', 'heure_debut'=>'08:00', 'heure_fin'=>'10:00', 'duree'=>120, 'statut'=>'realisee', 'created_at'=>now(), 'updated_at'=>now()],
            ['id'=>2,  'affectation_id'=>1, 'date_seance'=>'2025-12-16', 'heure_debut'=>'08:00', 'heure_fin'=>'10:00', 'duree'=>120, 'statut'=>'realisee', 'created_at'=>now(), 'updated_at'=>now()],
            ['id'=>3,  'affectation_id'=>2, 'date_seance'=>'2025-12-17', 'heure_debut'=>'10:00', 'heure_fin'=>'12:00', 'duree'=>120, 'statut'=>'realisee', 'created_at'=>now(), 'updated_at'=>now()],
            ['id'=>4,  'affectation_id'=>2, 'date_seance'=>'2025-12-18', 'heure_debut'=>'08:00', 'heure_fin'=>'10:00', 'duree'=>120, 'statut'=>'realisee', 'created_at'=>now(), 'updated_at'=>now()],
            ['id'=>5,  'affectation_id'=>1, 'date_seance'=>'2025-12-19', 'heure_debut'=>'14:00', 'heure_fin'=>'16:00', 'duree'=>120, 'statut'=>'realisee', 'created_at'=>now(), 'updated_at'=>now()],
            // Semaine 2 — 22-26 Dec
            ['id'=>6,  'affectation_id'=>1, 'date_seance'=>'2025-12-22', 'heure_debut'=>'08:00', 'heure_fin'=>'10:00', 'duree'=>120, 'statut'=>'realisee', 'created_at'=>now(), 'updated_at'=>now()],
            ['id'=>7,  'affectation_id'=>2, 'date_seance'=>'2025-12-23', 'heure_debut'=>'10:00', 'heure_fin'=>'12:00', 'duree'=>120, 'statut'=>'realisee', 'created_at'=>now(), 'updated_at'=>now()],
            ['id'=>8,  'affectation_id'=>1, 'date_seance'=>'2025-12-24', 'heure_debut'=>'08:00', 'heure_fin'=>'10:00', 'duree'=>120, 'statut'=>'realisee', 'created_at'=>now(), 'updated_at'=>now()],
            ['id'=>9,  'affectation_id'=>2, 'date_seance'=>'2025-12-25', 'heure_debut'=>'10:00', 'heure_fin'=>'12:00', 'duree'=>120, 'statut'=>'realisee', 'created_at'=>now(), 'updated_at'=>now()],
            ['id'=>10, 'affectation_id'=>1, 'date_seance'=>'2025-12-26', 'heure_debut'=>'14:00', 'heure_fin'=>'16:00', 'duree'=>120, 'statut'=>'realisee', 'created_at'=>now(), 'updated_at'=>now()],
            // Semaine 3 — 29 Dec - 02 Jan
            ['id'=>11, 'affectation_id'=>1, 'date_seance'=>'2025-12-29', 'heure_debut'=>'08:00', 'heure_fin'=>'10:00', 'duree'=>120, 'statut'=>'realisee', 'created_at'=>now(), 'updated_at'=>now()],
            ['id'=>12, 'affectation_id'=>2, 'date_seance'=>'2025-12-30', 'heure_debut'=>'10:00', 'heure_fin'=>'12:00', 'duree'=>120, 'statut'=>'realisee', 'created_at'=>now(), 'updated_at'=>now()],
            ['id'=>13, 'affectation_id'=>1, 'date_seance'=>'2025-12-31', 'heure_debut'=>'08:00', 'heure_fin'=>'10:00', 'duree'=>120, 'statut'=>'realisee', 'created_at'=>now(), 'updated_at'=>now()],
            ['id'=>14, 'affectation_id'=>2, 'date_seance'=>'2026-01-02', 'heure_debut'=>'10:00', 'heure_fin'=>'12:00', 'duree'=>120, 'statut'=>'realisee', 'created_at'=>now(), 'updated_at'=>now()],
            // Semaine 4 — 05-09 Jan
            ['id'=>15, 'affectation_id'=>1, 'date_seance'=>'2026-01-05', 'heure_debut'=>'08:00', 'heure_fin'=>'10:00', 'duree'=>120, 'statut'=>'realisee', 'created_at'=>now(), 'updated_at'=>now()],
            ['id'=>16, 'affectation_id'=>2, 'date_seance'=>'2026-01-06', 'heure_debut'=>'10:00', 'heure_fin'=>'12:00', 'duree'=>120, 'statut'=>'realisee', 'created_at'=>now(), 'updated_at'=>now()],
            ['id'=>17, 'affectation_id'=>1, 'date_seance'=>'2026-01-07', 'heure_debut'=>'08:00', 'heure_fin'=>'10:00', 'duree'=>120, 'statut'=>'realisee', 'created_at'=>now(), 'updated_at'=>now()],
            ['id'=>18, 'affectation_id'=>2, 'date_seance'=>'2026-01-08', 'heure_debut'=>'10:00', 'heure_fin'=>'12:00', 'duree'=>120, 'statut'=>'realisee', 'created_at'=>now(), 'updated_at'=>now()],
            ['id'=>19, 'affectation_id'=>1, 'date_seance'=>'2026-01-09', 'heure_debut'=>'14:00', 'heure_fin'=>'16:00', 'duree'=>120, 'statut'=>'realisee', 'created_at'=>now(), 'updated_at'=>now()],
            // Seances classe 2
            ['id'=>20, 'affectation_id'=>3, 'date_seance'=>'2025-12-15', 'heure_debut'=>'10:00', 'heure_fin'=>'12:00', 'duree'=>120, 'statut'=>'realisee', 'created_at'=>now(), 'updated_at'=>now()],
            ['id'=>21, 'affectation_id'=>3, 'date_seance'=>'2025-12-17', 'heure_debut'=>'08:00', 'heure_fin'=>'10:00', 'duree'=>120, 'statut'=>'realisee', 'created_at'=>now(), 'updated_at'=>now()],
            ['id'=>22, 'affectation_id'=>4, 'date_seance'=>'2025-12-16', 'heure_debut'=>'08:00', 'heure_fin'=>'10:00', 'duree'=>120, 'statut'=>'realisee', 'created_at'=>now(), 'updated_at'=>now()],
        ]);

        // ── Absences ──────────────────────────────────────────────────────
        $abs = [
            // Benjelloun (id=1) — absent sem1+2, retard sem3
            [1,1,'Absent',0],[1,2,'Absent',1],[1,3,'Present',0],[1,4,'Present',0],[1,5,'Present',0],
            [1,6,'Absent',0],[1,7,'Present',0],[1,8,'Absent',0],[1,9,'Present',0],[1,10,'Present',0],
            [1,11,'Retard',0],[1,12,'Present',0],[1,13,'Present',0],
            // Boukhari (id=2) — retards
            [2,1,'Retard',0],[2,2,'Present',0],[2,3,'Retard',0],[2,4,'Present',0],
            [2,6,'Present',0],[2,7,'Retard',0],[2,8,'Present',0],
            [2,11,'Present',0],[2,15,'Present',0],
            // Choujaa (id=3) — present
            [3,1,'Present',0],[3,2,'Present',0],[3,3,'Present',0],[3,6,'Present',0],[3,11,'Present',0],
            // El Ouazzani (id=4) — absent bezzaf (convocation)
            [4,1,'Absent',0],[4,2,'Absent',0],[4,3,'Absent',0],[4,4,'Absent',0],[4,5,'Absent',0],
            [4,6,'Absent',0],[4,7,'Absent',0],[4,8,'Absent',0],[4,9,'Present',0],
            [4,11,'Absent',0],[4,12,'Absent',0],
            // Lahsini (id=5) — present
            [5,1,'Present',0],[5,3,'Present',0],[5,6,'Present',0],[5,11,'Present',0],[5,15,'Present',0],
            // Sara (id=6) — classe 2
            [6,20,'Absent',0],[6,21,'Present',0],[6,22,'Retard',0],
            // Fatima (id=7) — classe 2
            [7,20,'Present',0],[7,21,'Absent',1],[7,22,'Present',0],
        ];

        foreach ($abs as $a) {
            DB::table('absences')->insert(['etudiant_id'=>$a[0],'seance_id'=>$a[1],'statut'=>$a[2],'justifie'=>$a[3],'created_at'=>now(),'updated_at'=>now()]);
        }

        echo "Test data seeded successfully!\n";
        echo "Classes: 3 | Etudiants: 8 | Enseignants: 3 | Modules: 3 | Affectations: 4 | Seances: 22 | Absences: " . count($abs) . "\n";
    }
}

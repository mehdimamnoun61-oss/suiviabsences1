<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TestDataSeeder extends Seeder
{
    public function run(): void
    {
        $classes = [
            [1,'TSDI-2A','Developpement Informatique','Technicien Specialise 2eme annee','A','2025/2026'],
            [2,'TSDI-2B','Developpement Informatique','Technicien Specialise 2eme annee','B','2025/2026'],
            [3,'TSDI-1A','Developpement Informatique','Technicien Specialise 1ere annee','A','2025/2026'],
            [4,'TSDI-1B','Developpement Informatique','Technicien Specialise 1ere annee','B','2025/2026'],
            [5,'GC-2A',  'Genie Civil',               'Technicien Specialise 2eme annee','A','2025/2026'],
            [6,'GC-1A',  'Genie Civil',               'Technicien Specialise 1ere annee','A','2025/2026'],
            [7,'GE-2A',  'Genie Electrique',          'Technicien Specialise 2eme annee','A','2025/2026'],
            [8,'GE-1A',  'Genie Electrique',          'Technicien Specialise 1ere annee','A','2025/2026'],
            [9,'CM-2A',  'Commerce et Marketing',     'Technicien Specialise 2eme annee','A','2025/2026'],
            [10,'CM-1A', 'Commerce et Marketing',     'Technicien Specialise 1ere annee','A','2025/2026'],
        ];
        foreach ($classes as $c) {
            DB::table('classes')->insert(['id'=>$c[0],'nom_classe'=>$c[1],'filiere'=>$c[2],'niveau'=>$c[3],'groupe'=>$c[4],'annee_scolaire'=>$c[5],'created_at'=>now(),'updated_at'=>now()]);
        }

        $enseignants = [
            [1,'Idrissi', 'Karim',  'k.idrissi@epg.ma', '0661000001','Programmation Web'],
            [2,'Jebari',  'Sanaa',  's.jebari@epg.ma',  '0661000002','Bases de donnees'],
            [3,'Karimi',  'Rachid', 'r.karimi@epg.ma',  '0661000003','Mathematiques'],
            [4,'Lahlou',  'Amina',  'a.lahlou@epg.ma',  '0661000004','Genie Civil'],
            [5,'Mansouri','Youssef','y.mansouri@epg.ma','0661000005','Electronique'],
        ];
        foreach ($enseignants as $e) {
            DB::table('enseignants')->insert(['id'=>$e[0],'nom'=>$e[1],'prenom'=>$e[2],'email'=>$e[3],'tel'=>$e[4],'specialite'=>$e[5],'created_at'=>now(),'updated_at'=>now()]);
        }

        $modules = [
            [1,'Programmation Web',40],[2,'Bases de donnees',35],
            [3,'Mathematiques',30],[4,'Genie Civil',45],[5,'Electronique',40],
        ];
        foreach ($modules as $m) {
            DB::table('modules')->insert(['id'=>$m[0],'nom_module'=>$m[1],'volume_horaire'=>$m[2],'created_at'=>now(),'updated_at'=>now()]);
        }

        $noms    = ['Alami','Benali','Chakir','Darif','El Fassi','Filali','Ghazi','Hajji','Idrissi','Jebari'];
        $prenoms = ['Youssef','Fatima','Omar','Salma','Hamza','Nadia','Anas','Rim','Karim','Sara'];
        $id = 1;
        foreach ($classes as $c) {
            for ($i = 0; $i < 8; $i++) {
                DB::table('etudiants')->insert([
                    'id'=>$id,'nom'=>$noms[($id-1)%10],'prenom'=>$prenoms[$i%10],
                    'email'=>strtolower($prenoms[$i%10].'.'.$noms[($id-1)%10].$id.'@epg.ma'),
                    'tel'=>'061200'.str_pad($id,4,'0',STR_PAD_LEFT),
                    'date_naissance'=>'200'.(($id%3)+1).'-0'.(($id%9)+1).'-15',
                    'sex'=>$i%2===0?'homme':'femme','classe_id'=>$c[0],
                    'created_at'=>now(),'updated_at'=>now(),
                ]);
                $id++;
            }
        }

        foreach ($classes as $idx => $c) {
            DB::table('affectations')->insert([
                'id'=>$idx+1,'enseignant_id'=>($idx%5)+1,'module_id'=>($idx%5)+1,
                'classe_id'=>$c[0],'annee_scolaire'=>'2025/2026','created_at'=>now(),'updated_at'=>now(),
            ]);
        }

        $dates = [
            '2025-12-15','2025-12-16','2025-12-17','2025-12-18','2025-12-19',
            '2025-12-22','2025-12-23','2025-12-24','2025-12-25','2025-12-26',
            '2025-12-29','2025-12-30','2025-12-31','2026-01-02',
            '2026-01-05','2026-01-06','2026-01-07','2026-01-08','2026-01-09',
        ];
        foreach ($dates as $i => $date) {
            DB::table('seances')->insert([
                'id'=>$i+1,'affectation_id'=>1,'date_seance'=>$date,
                'heure_debut'=>'08:00','heure_fin'=>'10:00','duree'=>120,
                'statut'=>'realisee','created_at'=>now(),'updated_at'=>now(),
            ]);
        }

        $statuts = [
            1=>['Absent','Absent','Present','Present','Present','Absent','Present','Absent','Present','Present','Retard','Present','Present','Present','Present','Present','Present','Present','Present'],
            2=>['Retard','Present','Retard','Present','Present','Present','Retard','Present','Present','Present','Present','Present','Present','Present','Present','Present','Present','Present','Present'],
            3=>['Present','Present','Present','Present','Present','Present','Present','Present','Present','Present','Present','Present','Present','Present','Present','Present','Present','Present','Present'],
            4=>['Absent','Absent','Absent','Absent','Absent','Absent','Absent','Absent','Present','Present','Absent','Absent','Present','Present','Present','Present','Present','Present','Present'],
            5=>['Present','Present','Present','Present','Present','Present','Present','Present','Present','Present','Present','Present','Present','Present','Present','Present','Present','Present','Present'],
            6=>['Absent','Present','Retard','Present','Present','Absent','Present','Present','Present','Present','Present','Present','Present','Present','Present','Present','Present','Present','Present'],
            7=>['Present','Retard','Present','Present','Present','Present','Present','Retard','Present','Present','Present','Present','Present','Present','Present','Present','Present','Present','Present'],
            8=>['Present','Present','Present','Absent','Present','Present','Present','Present','Present','Present','Present','Present','Present','Present','Present','Present','Present','Present','Present'],
        ];
        foreach ($statuts as $etuId => $list) {
            foreach ($list as $idx => $statut) {
                DB::table('absences')->insert([
                    'etudiant_id'=>$etuId,'seance_id'=>$idx+1,'statut'=>$statut,
                    'justifie'=>0,'created_at'=>now(),'updated_at'=>now(),
                ]);
            }
        }

        echo "Done! 10 classes, 80 etudiants, 5 enseignants, 19 seances\n";
    }
}

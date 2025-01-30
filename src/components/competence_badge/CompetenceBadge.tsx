import { Flex, Tooltip } from "antd"
import { Dechetterie, Factory, TrashCollector } from "../../utils/picto"

type Competence = 'dechetterie' | 'collecte' | 'traitement';

interface CompetenceBadgePros {
    competences: Competence[]
}

const competenceData:{ name: Competence; icon: React.ElementType; title: string }[] = [
    { name: 'collecte', icon: TrashCollector, title: 'Collecte' },
    { name: 'dechetterie', icon: Dechetterie, title: 'Déchetterie' },
    { name: 'traitement', icon: Factory, title: 'Traitement' }
];

const colors = { enabled: "#6A7F2B", disabled: "#E7E7E7" };

export const CompetenceBadge: React.FC<CompetenceBadgePros> = ({ competences }) => {
    return (
        <Flex style={{ height: '50px' }} gap={'middle'}>
            {competenceData.map(({ name, icon: Icon, title }) => {
                const isActive = competences.includes(name);
                const color = isActive ? colors.enabled : colors.disabled
                return (
                    <Tooltip key={name} title={title}  color={color}>
                        <Icon
                            height={35}
                            color={color}
                            aria-label={title}
                        />
                    </Tooltip>
                );
            })}
        </Flex>
    );
}
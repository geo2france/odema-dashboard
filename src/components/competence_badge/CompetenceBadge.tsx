import { Flex, Tooltip } from "antd"
import { Dechetterie, Factory, TrashCollector } from "../../utils/picto"

type Competence = 'dechetterie' | 'collecte' | 'traitement';

export type CompetencesExercees = Record<Competence, number>

interface CompetenceBadgePros {
    competences: CompetencesExercees
}

const competenceData:{ name: Competence; icon: React.ElementType; title: string }[] = [
    { name: 'collecte', icon: TrashCollector, title: 'Collecte' },
    { name: 'dechetterie', icon: Dechetterie, title: 'Déchetterie' },
    { name: 'traitement', icon: Factory, title: 'Traitement' }
];

const colors = { enabled: "#6A7F2B", disabled: "#E7E7E7", partial: "#A8BC6A" };

export const CompetenceBadge: React.FC<CompetenceBadgePros> = ({ competences }) => {
    return (
        <Flex style={{ height: '50px' }} gap={'middle'}>
            {competences && competenceData.map(({ name, icon: Icon, title }) => {
                const value = competences[name]
                const color = value >= 1 ? colors.enabled : value <= 0 ? colors.disabled : colors.partial
                return (
                    <Tooltip key={name} title={`${title} - ${Math.round(value*100)}% de la population`} color={color}>
                    <span style={{ position: 'relative', width: 35, height: 35, display: 'inline-block' }}>
                      {value >= 1 || value <= 0 ? (
                        <Icon height={35} fill={color} aria-label={title} />
                      ) : (
                        <>
                          {/* Icône de fond grise */}
                          <Icon height={35} fill={colors.disabled} style={{ position: 'absolute', top: 0, left: 0 }} />
                  
                          {/* Icône orange partiellement visible par clipPath */}
                          <svg
                            width={35}
                            height={35}
                            style={{ position: 'absolute', top: 0, left: 0 }}
                            viewBox="0 0 35 35"
                          >
                            <defs>
                              <clipPath id={`clip-${name}`}>
                                <rect x="0" y={35 * (1 - value)} width="35" height={35 * value} />
                              </clipPath>
                            </defs>
                            <g clipPath={`url(#clip-${name})`}>
                              <Icon height={35} fill={colors.partial} />
                            </g>
                          </svg>
                        </>
                      )}
                    </span>
                  </Tooltip>
                );
            })}
        </Flex>
    );
}
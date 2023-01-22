import { useState, useEffect } from "react";
import { ScrollView, View, Text, Alert } from "react-native";
import { useRoute } from '@react-navigation/native'
import { BackButton } from "../components/BackButton";
import dayjs from "dayjs";
import { ProgressBar } from "../components/ProgressBar";
import { CheckBox } from "../components/CheckBox";
import { Loading } from "../components/Loading";
import { HabitIsEmpty } from "../components/HabitsEmpty";
import { api } from "../lib/axios";
import { generateProgressPercentage } from "../utils/generate-progress-porcentage";
import clsx from "clsx";

interface Params {
    date: string;
}

interface DayIndoProps {
    completedHabits: string[];
    possibleHabits: {
        id: string;
        title: string;
    }[];
}

export function Habit() {

    const [loading, setLoading] = useState(true)
    const [dayInfo, SetDayInfo] = useState<DayIndoProps | null>(null)
    const [completeHabits, setCompletedHabits] = useState<string[]>([])

    const route = useRoute();
    const { date } = route.params as Params;

    const parsedDate = dayjs(date);
    const dayOfWeek = parsedDate.format('dddd')
    const isDateInPast = parsedDate.endOf('day').isBefore(new Date())
    const dayAndMonth = parsedDate.format('DD/MM')

    const habitsProgress = dayInfo?.possibleHabits?.length ? generateProgressPercentage(dayInfo.possibleHabits.length, completeHabits.length) : 0

    async function fetchHabits() {
        try {
            setLoading(true);

            const response = await api.get('/day', { params: { date } });
            SetDayInfo(response.data);
            setCompletedHabits(response.data.completedHabits ?? [])

        } catch (error) {
            console.log(error)
            Alert.alert('Ops', 'Não foi possivel carregar as informaçções dos hábitos')
        } finally {
            setLoading(false)
        }

    }

    async function handleToggleHabit(habitId: string) {
        try {
            await api.patch(`/habits/${habitId}/toggle`)
            if (completeHabits.includes(habitId)) {
                setCompletedHabits(prevState => prevState?.filter(habit => habit !== habitId))
            } else {
                setCompletedHabits(prevState => [...prevState, habitId])
            }
        } catch (error) {
            console.log(error)
            Alert.alert('Ops', 'Não foi possível atualizar o status do hábito')
        }

    }

    useEffect(() => {
        fetchHabits()
    }, []);

    if (loading) {
        return (
            <Loading />
        );
    }


    return (
        <View className="flex-1 bg-background px-8 pt-16">
            <ScrollView
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                <BackButton />

                <Text className="mt-6 text-zinc-400 font-semibold text-base lowecase">
                    {dayOfWeek}
                </Text>

                <Text className="mt-6 text-zinc-400 font-semibold text-base lowecase">
                    {dayAndMonth}
                </Text>

                <ProgressBar progress={habitsProgress} />

                <View className={clsx("mt-6", {
                    ['opacity-50']: isDateInPast
                })}>
                    {
                        dayInfo?.possibleHabits ?
                            dayInfo?.possibleHabits.map(habit =>
                            (
                                <CheckBox
                                    key={habit.id}
                                    title={habit.title}
                                    checked={completeHabits.includes(habit.id)}
                                    disabled={isDateInPast}
                                    onPress={() => handleToggleHabit(habit.id)}
                                />
                            ))
                            : <HabitIsEmpty />
                    }



                </View>

                {
                    isDateInPast && (
                        <Text className="text-white mt-10 text-center">
                            Você não pode editar hábitos de uma data passada.
                        </Text>
                    )
                }
            </ScrollView>

        </View>
    )
}
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import InteractiveMap from './InterativeMap'
import Image from 'next/image'

const tabs = [
  {
    name: 'Map',
    value: 'map',
    count: 1,
    content: (
      <>
        <InteractiveMap/>
      </>
    )
  },
  {
    name: 'Sketch Map',
    value: 'sketch-map',
    count: 1,
    content: (
      <div className="w-full h-full relative aspect-video min-h-[500px]  ">
       <Image
         src="/sketch.jpg"
         alt="sketch"
         fill
         className="object-contain rounded-md "
       />
      </div>
    )
  },
//   {
//     name: 'Surprise',
//     value: 'surprise',
//     count: 6,
//     content: (
//       <>
//         <span className='text-foreground font-semibold'>Surprise!</span> Here&apos;s something unexpected—a fun fact, a
//         quirky tip, or a daily challenge. Come back for a new surprise every day!
//       </>
//     )
//   }
]

const TabsWithBadge = () => {
  return (
    <div className='w-full'>
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 text-center">Interactive Pipeline Map</h2>
      <Tabs defaultValue='map' className='gap-4'>
        <TabsList>
          {tabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className='flex items-center gap-1 px-2.5 sm:px-3'>
              {tab.name}
              <Badge className='h-5 min-w-5 px-1 tabular-nums'>{tab.count}</Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map(tab => (
          <TabsContent key={tab.value} value={tab.value}>
            <div className='w-full h-full '>{tab.content}</div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

export default TabsWithBadge
